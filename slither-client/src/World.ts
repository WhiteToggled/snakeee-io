import { Container, Graphics, Point } from "pixi.js";

export const WORLD_RADIUS = 2000;
const N_ORBS = 250;

export class World {
    public container: Container;
    private background: Graphics;

    constructor() {
        this.container = new Container();

        this.background = new Graphics().circle(0, 0, WORLD_RADIUS).fill(0x161c22);
        this.container.addChild(this.background);

        for (let i = 0; i < N_ORBS; ++i) {
            const orb = new Graphics();

            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * (WORLD_RADIUS - 10);

            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            orb.circle(x, y, Math.floor(Math.random() * 10) + 1)
                .fill(0x44aaff);

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
