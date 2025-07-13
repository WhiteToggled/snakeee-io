import { Graphics, Point } from "pixi.js";
import { WORLD_RADIUS } from "./World";

const PLAYER_RADIUS = 20;
const PLAYER_SPEED = 5;
const DEADZONE = 1;

export class Player {
    public sprite: Graphics;

    constructor() {
        this.sprite = new Graphics().circle(0, 0, PLAYER_RADIUS).fill("white");
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

            this.sprite.x += nx * PLAYER_SPEED;
            this.sprite.y += ny * PLAYER_SPEED;

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
