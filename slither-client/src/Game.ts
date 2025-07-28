import { Application, Point } from "pixi.js";
import { World } from "./World";
import { Player } from "./Player";
import { Input } from "./Input";
import { Overlay } from "./Overlay";

export class Game {
    private app: Application;
    private input!: Input;
    private world!: World;

    private player!: Player;
    private lastScore: number = 0;

    private overlay!: Overlay;
    private screenCenter: Point = new Point();

    constructor(app: Application) {
        this.app = app;
    }

    public async start(containerID: string = "pixi-container") {
        await this.app.init({ background: "", resizeTo: window });
        const container = document.getElementById(containerID);
        if (!container) throw new Error('Cannot initialize game. Container not found');
        container.appendChild(this.app.canvas);

        // For PIXI Debugger
        // remove on prod
        globalThis.__PIXI_APP__ = this.app;

        this.world = new World();
        await this.world.init();
        this.app.stage.addChild(this.world.container);

        this.overlay = new Overlay();
        this.app.stage.addChild(this.overlay.container);

        this.player = new Player();
        this.world.add(this.player.sprite);

        this.input = new Input(this.app.canvas);

        // positioning
        this.updateScreenCenter();
        this.world.setPosition(this.screenCenter);
        window.addEventListener("resize", () => {
            this.updateScreenCenter();
            this.world.setPosition(this.screenCenter);
        });

        this.app.ticker.add((delta) => this.update(delta.deltaTime));
    }
    
    private updateScreenCenter() {
        this.screenCenter.set(this.app.screen.width / 2, this.app.screen.height / 2);
    }

    private update(delta: number) {
        this.player.update(this.world.getOrbPool(), this.input, this.input.mousePos, this.screenCenter, delta);

        this.world.update(this.player, delta);

        const currentScore = Math.floor(this.player.score);
        if (currentScore !== this.lastScore) {
            this.lastScore = currentScore;
            this.overlay.setScore(currentScore);
        }
    }
}
