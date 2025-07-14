import { Container, Graphics, Point } from "pixi.js";
import { Orb } from "./Orb";

export const WORLD_RADIUS = 2000;
const N_ORBS = 250;

export class World {
    public container: Container;
    private background: Graphics;
    private orbs: Orb[] = [];

    constructor() {
        this.container = new Container();

        this.background = new Graphics().circle(0, 0, WORLD_RADIUS).fill(0x161c22);
        this.container.addChild(this.background);

        this.spawnOrbs(N_ORBS);
    }

    private spawnOrbs(nOrbs: number) {
        for (let i = 0; i < nOrbs; ++i) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * (WORLD_RADIUS - 10);

            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            const orb = new Orb(x, y, Math.floor(Math.random() * 10) + 1);
            this.orbs.push(orb);
            this.container.addChild(orb);
        }

    }

    public setPosition(center: Point) {
        this.container.position.copyFrom(center);
    }

    public addEntity(et: Graphics) {
        this.container.addChild(et);
    }

    public update(pivot: Point) {
        this.container.pivot.copyFrom(pivot);
    }
}
