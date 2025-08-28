import { Graphics, Container, Point } from "pixi.js";
import { PlayerState } from "../../shared/models/player_state";
import * as constants from "../../shared/models/constants";

export class Player {
    private id: string;
    public sprite: Container;

    private segments: Graphics[] = [];
    private segmentPositions: { x: number; y: number }[] = [];

    private color: number = 0xff00ff;
    public radius: number = 10;
    private scale: number = 1;
    public score: number = constants.MIN_SCORE;

    constructor(id: string) {
        this.id = id;

        this.sprite = new Container();
    }

    public get position(): Point {
        return this.sprite.position;
    }

    public getId(): string {
        return this.id;
    }


    public updateFromServer(state: PlayerState) {
        // Apply server position and scale
        this.sprite.position.set(state.position[0], state.position[1]);
        this.radius = state.radius;
        this.scale = state.scale ?? 1;
        this.sprite.scale.set(this.scale);

        if (state.alive !== undefined) {
            this.sprite.visible = state.alive;
        }

        if (state.color !== undefined) {
            this.color = state.color;
        }

        while (this.segments.length < state.segmentCount) {
            this.addSegment();
        }
        while (this.segments.length > state.segmentCount) {
            const removed = this.segments.pop();
            if (removed) this.sprite.removeChild(removed);
        }

        // set head
        this.segmentPositions[0] = { 
            x: state.position[0], 
            y: state.position[1] 
        };

    }

    private addSegment() {
        const lastPos =
            this.segmentPositions.length > 0
                ? this.segmentPositions[this.segmentPositions.length - 1]
                : this.position;
        this.segmentPositions.push({ x: lastPos.x, y: lastPos.y });

        const seg = new Graphics()
            .circle(0, 0, constants.BASE_RADIUS)
            .fill(this.color)
            .stroke(0x000000);

        this.segments.push(seg);
        this.sprite.addChild(seg);
    }

    public updateSegments(_delta: number) {
        for (let i = 1; i < this.segmentPositions.length; ++i) {
            const prev = this.segmentPositions[i - 1];
            const curr = this.segmentPositions[i];

            const dx = prev.x - curr.x;
            const dy = prev.y - curr.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > constants.SEGMENT_SPACING) {
                const t = constants.SEGMENT_SPACING / dist;
                curr.x = prev.x - dx * t;
                curr.y = prev.y - dy * t;
            }

            // update PIXI graphics for each segment
            if (this.segments[i]) {
                this.segments[i].position.set(
                    curr.x - this.segmentPositions[0].x,
                    curr.y - this.segmentPositions[0].y
                );
                this.segments[i].clear();
                this.segments[i]
                    .circle(0, 0, constants.BASE_RADIUS)
                    .fill(this.color)
                    .stroke(0x000000);
            }
        }
    }
}
