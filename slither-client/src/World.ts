import { Container, Graphics, Point } from "pixi.js";
import { OrbPool } from "./OrbPool";
import { Player, BASE_RADIUS } from "./Player";

export const WORLD_RADIUS = 2000;

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

    public getOrbPool() {
        return this.orbPool;
    }

    public add(et: Container) {
        this.container.addChild(et);
    }

    public update(player: Player, delta: number) {
        const SMOOTHING = 1 - Math.exp(- delta * 5);
        this.container.pivot.copyFrom(player.position);

        const zoomFactor = Math.max(0.4, Math.min(1 / (1 + (player.radius - BASE_RADIUS) / 70),));
        this.container.scale.x += (zoomFactor - this.container.scale.x) * SMOOTHING;
        this.container.scale.y += (zoomFactor - this.container.scale.y) * SMOOTHING;

        this.orbPool.update(delta, player);
    }
}
