import { Graphics, Container, Point } from "pixi.js";
import { Input } from "./Input";
import { WORLD_RADIUS } from "./World";

const DEADZONE = 1;

const PLAYER_SPEED = 5;
const BOOST_DRAIN = 5;
const MIN_SCORE = 10;

export const BASE_RADIUS = 20;
const SCALE_FACTOR = 0.02;

const BASE_LENGTH = 6;
const SEGMENT_SPACING = 10;
const GROWTH_PER_SCORE = (1/10);

export class Player {
    public sprite: Container;
    private segments: Graphics[] = [];
    private segmentPositions: Point[] = [];

    public scale: number = 1;
    public score: number = MIN_SCORE;
    public isBoosting: boolean = false;

    constructor() {
        this.sprite = new Container();

        this.segmentPositions.push(new Point(0, 0));
        for (let i = 0; i < BASE_LENGTH; ++i) {
            this.addSegment();
        }
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

        const desiredSegmentCount = BASE_LENGTH + Math.floor((this.score - MIN_SCORE) * GROWTH_PER_SCORE);

        while (this.segments.length < desiredSegmentCount) {
            this.addSegment();
        }
        while (this.segments.length > desiredSegmentCount) {
            const removed = this.segments.pop();
            if (removed) {
                this.sprite.removeChild(removed);
            }
            this.segmentPositions.pop();
        }
        // console.log(`Score: ${this.score}`);
    }

    private move(n: Point, speed: number, smoothing: number) {
        // lerp it
        const targetX = this.sprite.x + n.x * speed;
        const targetY = this.sprite.y + n.y * speed;

        this.sprite.x += (targetX - this.sprite.x) * smoothing;
        this.sprite.y += (targetY - this.sprite.y) * smoothing;

        // World Bounding
        const r = Math.sqrt(this.sprite.x ** 2 + this.sprite.y ** 2);
        const limit = WORLD_RADIUS - this.radius;
        if (r > limit) {
            const ratio = limit / r;
            this.sprite.x *= ratio;
            this.sprite.y *= ratio;
        }
    }
    
    private addSegment() {
        const seg = new Graphics().circle(0, 0, BASE_RADIUS).fill("blue").stroke(0x000000);

        this.segments.push(seg);

        const lastPos = this.segmentPositions.length > 0
            ? this.segmentPositions[this.segmentPositions.length - 1]
            : this.sprite.position;

        this.segmentPositions.push(lastPos.clone());
        this.sprite.addChild(seg);
    }

    public update(inputs: Input, mousePos: Point, appCenter: Point, delta: number) {
        // For singleplayer testing
        if (!document.hasFocus()) return;

        const SMOOTHING = 1 - Math.exp(- delta * 5);
        const dx = mousePos.x - appCenter.x;
        const dy = mousePos.y - appCenter.y;
        const len = Math.sqrt(dx * dx + dy * dy);

        if (len > DEADZONE) {
            const n = new Point(dx / len, dy / len);

            const speed = this.isBoosting ? PLAYER_SPEED * 2 : PLAYER_SPEED;
            this.move(n, speed, SMOOTHING);
        }

        this.isBoosting = inputs.mouseDown && this.score > MIN_SCORE;
        if (this.isBoosting) {
            const drain = -(BOOST_DRAIN * delta) / 60;
            this.updateScore(drain);
            if (this.score === MIN_SCORE) this.isBoosting = false;
        }

        // Updates head position
        this.segmentPositions[0] = this.sprite.position.clone();

        for (let i = 1; i < this.segmentPositions.length; ++i) {
            const prev = this.segmentPositions[i - 1];
            const curr = this.segmentPositions[i];

            const dx = prev.x - curr.x;
            const dy = prev.y - curr.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > SEGMENT_SPACING) {
                const t = SEGMENT_SPACING / dist;
                curr.x = prev.x - dx * t;
                curr.y = prev.y - dy * t;
            }
        }

        for (let i = 0; i < this.segments.length; ++i) {
            const follow = this.segmentPositions[i + 1];
            if (follow) {
                this.segments[i].position.set(
                    follow.x - this.sprite.x,
                    follow.y - this.sprite.y
                );
            }
        }
    }
}
