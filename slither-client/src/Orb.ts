import { Graphics } from "pixi.js";
import { WORLD_RADIUS } from "./World";

const RESPAWN_TIME = 5;

export class Orb extends Graphics {
    private radius: number;
    public active: boolean = true;
    private respawnTime: number = 0;

    constructor(x: number, y: number, radius: number, color = 0x44aaff) {
        super();
        this.radius = radius;
        this.circle(0, 0, radius).fill(color);
        this.position.set(x, y);
    }

    public getRadius(): number {
        return this.radius;
    }

    public kill() {
        this.active = false;
        this.visible = false;
        this.respawnTime = RESPAWN_TIME;
    }

    private respawn() {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * (WORLD_RADIUS - 10);

        this.x = Math.cos(angle) * radius;
        this.y = Math.sin(angle) * radius;

        this.active = true;
        this.visible = true;
    }

    public update(delta: number) {
        if (!this.active) {
            this.respawnTime -= delta / 60;
            // console.log(`Respawning in ${this.respawnTime}`);

            if (this.respawnTime <= 0) {
                this.respawn();
            }
        }
    }
}
