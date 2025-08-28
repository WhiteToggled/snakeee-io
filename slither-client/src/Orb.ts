import { Graphics } from "pixi.js";

export class Orb extends Graphics {
    private radius: number;
    public active: boolean = true;
    public id: number = 0;

    constructor(x: number, y: number, radius: number) {
        super();
        this.radius = radius;
        this.circle(0, 0, radius).fill(0xff00ff);
        this.position.set(x, y);
    }

    public setId(id: number) {
        this.id = id;
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
