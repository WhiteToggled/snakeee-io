import { Graphics, Point } from "pixi.js";
import { Input } from "./Input";
import { WORLD_RADIUS } from "./World";

const DEADZONE = 1;

const PLAYER_SPEED = 10;

const BOOST_DRAIN = 5;
const MIN_SCORE = 10;

const BASE_RADIUS = 20;
const SCALE_FACTOR = 0.025;

export class Player {
    public sprite: Graphics;

    public scale: number = 1;
    public score: number = MIN_SCORE;
    public isBoosting: boolean = false;

    constructor() {
        this.sprite = new Graphics()
            .circle(0, 0, BASE_RADIUS)
            .fill("white");
    }
    
    public get position() : Point {
        return this.sprite.position;
    }

    public get radius(): number {
        return BASE_RADIUS * this.scale;
    }
    
    public updateScore(amount: number = 1) {
        this.score = Math.max(MIN_SCORE, this.score + amount);
        this.scale = 1 + Math.sqrt(this.score - MIN_SCORE) * SCALE_FACTOR;
        this.sprite.scale.set(this.scale);

        console.log(`Score: ${this.score}`);
    }

    private move(n: Point, speed: number, smoothing: number) {
        // lerp it
        const targetX = this.sprite.x + n.x * speed;
        const targetY = this.sprite.y + n.y * speed;

        this.sprite.x += (targetX - this.sprite.x) * smoothing;
        this.sprite.y += (targetY - this.sprite.y) * smoothing;

    }

    public update(inputs: Input, mousePos: Point, appCenter: Point, delta: number) {
        // For singleplayer testing
        if (!document.hasFocus()) return;

        const dx = mousePos.x - appCenter.x;
        const dy = mousePos.y - appCenter.y;
        const len = Math.sqrt(dx * dx + dy * dy);

        if (len > DEADZONE) {
            const n = new Point(dx / len, dy / len);

            const speed = this.isBoosting ? PLAYER_SPEED * 2 : PLAYER_SPEED;
            const SMOOTHING = 1 - Math.exp(- delta / 1.2);
            this.move(n, speed, SMOOTHING);

            // World Bounding
            const r = Math.sqrt(this.sprite.x  ** 2 + this.sprite.y ** 2);
            const limit = WORLD_RADIUS - this.radius;
            if (r > limit) {
                const ratio = limit / r;
                this.sprite.x *= ratio;
                this.sprite.y *= ratio;
            }
        }

        this.isBoosting = inputs.mouseDown && this.score > MIN_SCORE;

        if (this.isBoosting) {
            const drain = -(BOOST_DRAIN * delta) / 60;
            this.updateScore(drain);
            if (this.score === MIN_SCORE) this.isBoosting = false;
        }
    }
}
