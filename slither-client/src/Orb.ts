import { Graphics } from "pixi.js";

export class Orb extends Graphics {
    private radius: number;
    public active: boolean = true;
    // private time = Math.random() * Math.PI * 2;

    constructor(x: number, y: number, radius: number, color = 0x44aaff) {
        super();
        this.radius = radius;
        this.circle(0, 0, radius).fill(color);
        this.position.set(x, y);
    }

    public getRadius(): number {
        return this.radius;
    }

    public update(delta: number) {
        // this animation sucks ill write a better one later
        // this.time += 0.05 * delta;
        // const pulse = 0.25 * Math.sin(this.time) + 0.75;
        // this.alpha = pulse;
    }
}
