import { Graphics } from "pixi.js";

export class Orb extends Graphics {
    constructor(x: number, y: number, radius: number, color = 0x44aaff) {
        super();
        this.circle(x, y, radius). fill(color);
    }
}
