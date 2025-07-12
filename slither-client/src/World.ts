import { Container, Graphics } from "pixi.js";

export const WORLD_RADIUS = 2000;
export const N_ORBS = 250;

export function createWorld(): Container {
    const world = new Container();

    const bg = new Graphics().circle(0, 0, WORLD_RADIUS).fill(0x161c22);
    world.addChild(bg);
    for (let i = 0; i < N_ORBS; ++i) {
        const dot = new Graphics();

        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * (WORLD_RADIUS - 10);

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        dot.circle(x, y, Math.floor(Math.random() * 10) + 1)
            .fill(0x44aaff);

        world.addChild(dot);
    }

    return world;

}
