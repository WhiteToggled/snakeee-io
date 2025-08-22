import { Graphics } from "pixi.js";

export class Orb extends Graphics {
    private radius: number;
    public active: boolean = true;

    constructor(x: number, y: number, radius: number, color = 0x44aaff) {
        super();
        this.radius = radius;
        this.circle(0, 0, radius).fill(color);
        this.position.set(x, y);
    }

    public getRadius(): number {
        return this.radius;
    }
    
    public setRadius(r: number) {
        this.radius = r;
    }

    public kill() {
        this.active = false;
        this.visible = false;
    }
}
