import { Container, Graphics, Point } from "pixi.js";
import { OrbPool } from "./OrbPool";
import { WorldState } from "../../shared/models/world_state";
import { WORLD_RADIUS } from "../../shared/models/constants";

export class World {
    public container: Container;
    private background: Graphics;
    private orbPool: OrbPool;

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

    public updateFromServer(state: WorldState) {
        this.orbPool.updateFromServer(state.orbs);
    }
}
