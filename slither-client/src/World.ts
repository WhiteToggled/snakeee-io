import { Container, Graphics, Point } from "pixi.js";
import { OrbPool } from "./OrbPool";
import { OrbState } from "../../shared/models/orb_state";
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
        this.container.addChild(this.orbPool.getContainer());
    }

    public setPosition(center: Point) {
        this.container.position.copyFrom(center);
    }

    public add(child: Container) {
        this.container.addChild(child);
    }

    public spawnBatchOrbs(orbStates: OrbState[]) {
        this.orbPool.spawnOrbsBatchAsync(orbStates);
    }

    public spawnOrb(orb: OrbState) {
        this.orbPool.spawnOrb(orb);
    }

    public despawnOrb(id: number) {
        this.orbPool.despawnOrb(id);
    }
}

