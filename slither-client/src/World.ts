import { Container, Graphics, Point } from "pixi.js";
import { OrbPool } from "./OrbPool";
import { WorldState } from "../../shared/models/world_state";
import { PlayerState } from "../../shared/models/player_state";
import { WORLD_RADIUS } from "../../shared/models/constants";

export class World {
    public container: Container;
    private background: Graphics;
    private orbPool: OrbPool;

    private players: Map<string, Container> = new Map();

    constructor() {
        this.container = new Container();

        this.background = new Graphics().circle(0, 0, WORLD_RADIUS).fill(0x161c22);
        this.container.addChild(this.background);

        this.orbPool = new OrbPool();
    }

    public async init() {
        await this.orbPool.initializeAsync();
        this.container.addChild(this.orbPool.getContainer());
    }

    public setPosition(center: Point) {
        this.container.position.copyFrom(center);
    }

    public add(et: Container) {
        this.container.addChild(et);
    }

    public updateFromServer(state: WorldState, myPlayerId: string) {
        this.orbPool.updateFromServer(state.orbs);

        for (const [id, playerState] of Object.entries(state.players)) {
            let sprite = this.players.get(id);
            if (!sprite) {
                // TODO: Create Player sprite/graphics
                sprite = new Container();
                this.players.set(id, sprite);
                this.container.addChild(sprite);
            }

            sprite.position.set(playerState.position.x, playerState.position.y);
            sprite.scale.set(playerState.radius / 10); // example scaling
        }

        const me: PlayerState | undefined = state.players[myPlayerId];
        if (me) {
            const SMOOTHING = 0.1;
            this.container.pivot.x += (me.position.x - this.container.pivot.x) * SMOOTHING;
            this.container.pivot.y += (me.position.y - this.container.pivot.y) * SMOOTHING;

            // zoom (client-only smoothing)
            const zoomFactor = Math.max(0.4, Math.min(1 / (1 + (me.radius - 10) / 70)));
            this.container.scale.x += (zoomFactor - this.container.scale.x) * SMOOTHING;
            this.container.scale.y += (zoomFactor - this.container.scale.y) * SMOOTHING;
        }
    }
}
