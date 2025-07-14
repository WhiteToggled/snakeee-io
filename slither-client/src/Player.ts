import { Graphics, Point } from "pixi.js";
import { WORLD_RADIUS } from "./World";

const PLAYER_RADIUS = 20;
const PLAYER_SPEED = 10;
const DEADZONE = 1;

export class Player {
    public sprite: Graphics;
    public score: number = 0;

    constructor() {
        this.sprite = new Graphics()
            .circle(0, 0, PLAYER_RADIUS)
            .fill("white");
    }
    
    public get position() : Point {
        return this.sprite.position;
    }
    
    public get radius() : number {
        return PLAYER_RADIUS;
    }

    public updateScore(amount: number = 1) {
        this.score += amount;

        console.log(`Score: ${this.score}`);
    }

    public update(mousePos: Point, appCenter: Point) {
        // For singleplayer testing
        if (!document.hasFocus()) return;

        const dx = mousePos.x - appCenter.x;
        const dy = mousePos.y - appCenter.y;
        const len = Math.sqrt(dx * dx + dy * dy);

        if (len > DEADZONE) {
            const nx = dx / len;
            const ny = dy / len;

            // lerp
            const targetX = this.sprite.x + nx * PLAYER_SPEED;
            const targetY = this.sprite.y + ny * PLAYER_SPEED;

            // ideally use time based smoothing factor
            // this is good enough for now
            const SMOOTHING = 0.6; 
            this.sprite.x += (targetX - this.sprite.x) * SMOOTHING;
            this.sprite.y += (targetY - this.sprite.y) * SMOOTHING;

            // World Bounding
            const r = Math.sqrt(this.sprite.x  ** 2 + this.sprite.y ** 2);
            const limit = WORLD_RADIUS - PLAYER_RADIUS;
            if (r > limit) {
                const ratio = limit / r;
                this.sprite.x *= ratio;
                this.sprite.y *= ratio;
            }
        }
    }
}
