import { Application, Point } from "pixi.js";
import { World } from "./World";
import { Input } from "./Input";
import { Player } from "./Player";
import { Overlay } from "./Overlay";
import { WorldState } from "../../shared/models/world_state";
import { InputMessage, ServerToClientMessage } from "../../shared/types/messages";

export class Game {
    private app: Application;
    private input!: Input;
    private world!: World;
    private overlay!: Overlay;
    private screenCenter: Point = new Point();

    private socket!: WebSocket;
    // private currentWorldState: WorldState | null = null;

    private players: Map<string, Player> = new Map();
    private myId: string | null = null;

    constructor(app: Application) {
        this.app = app;
    }

    public async start(containerID: string = "pixi-container") {
        await this.app.init({ background: "", resizeTo: window });
        const container = document.getElementById(containerID);
        if (!container)
            throw new Error("Cannot initialize game. Container not found");
        container.appendChild(this.app.canvas);

        globalThis.__PIXI_APP__ = this.app; // Debug only

        this.world = new World();
        await this.world.init();
        this.app.stage.addChild(this.world.container);

        this.overlay = new Overlay();
        this.app.stage.addChild(this.overlay.container);

        this.input = new Input(this.app.canvas);

        this.updateScreenCenter();
        this.world.setPosition(this.screenCenter);
        window.addEventListener("resize", () => {
            this.updateScreenCenter();
            this.world.setPosition(this.screenCenter);
        });

        // game loop
        this.app.ticker.add((delta) => this.update(delta.deltaTime));
    }


    private handleWorldUpdate(state: WorldState) {
        this.world.updateFromServer(state);

        // update / spawn players
        for (const [id, playerState] of Object.entries(state.players)) {
            let player = this.players.get(id);
            if (!player) {
                player = new Player(id);
                this.players.set(id, player);
                this.world.add(player.sprite);
            }

            player.updateFromServer(playerState);

            if (id === this.myId) {
                this.overlay.setScore(playerState.score);
            }
        }

        // remove disconnected players
        for (const id of Array.from(this.players.keys())) {
            if (!state.players[id]) {
                this.removePlayer(id);
            }
        }
    }

    private addPlayer(id: string) {
        if (!this.players.has(id)) {
            const p = new Player(id);
            this.players.set(id, p);
            this.world.add(p.sprite);
        }
    }

    private removePlayer(id: string) {
        const player = this.players.get(id);
        if (player) {
            this.world.container.removeChild(player.sprite);
            this.players.delete(id);
        }
    }

    public async connect(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.socket = new WebSocket(url);

            this.socket.onopen = () => {
                console.log("Connected to server:", url);
                resolve();
            };

            this.socket.onerror = (err) => {
                console.error("WebSocket error", err);
                reject(err);
            };

            this.socket.onclose = () => {
                console.warn("Disconnected from server");
            };

            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data) as ServerToClientMessage;

                switch (data.type) {
                    case "init":
                        this.myId = data.playerId;
                        break;

                    case "world_update":
                        // this.currentWorldState = data.state;
                        this.handleWorldUpdate(data.state);
                        break;

                    case "player_join":
                        this.addPlayer(data.player.id);
                        break;

                    case "player_leave":
                        this.removePlayer(data.playerId);
                        break;
                }
            };
        });
    }

    private sendInput(input: Input) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
        if (!this.myId) return;

        const me = this.players.get(this.myId);
        if (!me) return;

        const dx = input.mousePos.x - this.app.renderer.width / 2;
        const dy = input.mousePos.y - this.app.renderer.height / 2;
        const len = Math.sqrt(dx * dx + dy * dy);

        const dir = len > 0 ? { x: dx / len, y: dy / len } : { x: 0, y: 0 };

        const msg: InputMessage = {
            mousePos: dir,
            mouseDown: input.mouseDown,
        };

        this.socket.send(JSON.stringify(msg));
    }

    private updateScreenCenter() {
        this.screenCenter.set(
            this.app.screen.width / 2,
            this.app.screen.height / 2,
        );
    }

    private update(delta: number) {
        // send inputs each frame
        this.sendInput(this.input);

        if (this.myId) {
            const me = this.players.get(this.myId);
            if (me) {
                const SMOOTHING = 1 - Math.exp(-delta * 5);

                this.world.container.pivot.x += (me.sprite.x - this.world.container.pivot.x) * SMOOTHING;
                this.world.container.pivot.y += (me.sprite.y - this.world.container.pivot.y) * SMOOTHING;

                const zoomFactor = Math.max(0.4, Math.min(1 / (1 + (me.radius - 10) / 70)));
                this.world.container.scale.x += (zoomFactor - this.world.container.scale.x) * SMOOTHING;
                this.world.container.scale.y += (zoomFactor - this.world.container.scale.y) * SMOOTHING;
            }
        }
    }
}
