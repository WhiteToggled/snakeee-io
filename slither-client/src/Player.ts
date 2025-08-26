import { Graphics, Container, Point } from "pixi.js";
import { PlayerState } from "../../shared/models/player_state";
import * as constants from "../../shared/models/constants";

export class Player {
    private id: string;
    public sprite: Container;

    private segments: Graphics[] = [];

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


    public updateFromServer(state: PlayerState) {
        // Apply server position and scale
        this.sprite.position.set(state.position.x, state.position.y);
        this.radius = state.radius;
        this.scale = state.scale ?? 1;
        this.sprite.scale.set(this.scale);

        if (state.alive !== undefined) {
            this.sprite.visible = state.alive;
        }

        if (state.color !== undefined) {
            this.color = state.color;
        }

        const desiredCount = state.segmentPositions.length;
        while (this.segments.length < desiredCount) {
            this.addSegment();
        }
        while (this.segments.length > desiredCount) {
            const removed = this.segments.pop();
            if (removed) this.sprite.removeChild(removed);
        }

        for (let i = 0; i < this.segments.length; i++) {
            const segPos = state.segmentPositions[i];
            if (segPos) {
                this.segments[i].position.set(
                    segPos.x - state.position.x,
                    segPos.y - state.position.y
                );

                this.segments[i].clear();
                this.segments[i]
                    .circle(0, 0, constants.BASE_RADIUS)
                    .fill(this.color)
                    .stroke(0x000000);
            }
        }
    }

    private addSegment() {
        const seg = new Graphics()
            .circle(0, 0, constants.BASE_RADIUS)
            .fill(this.color)
            .stroke(0x000000);

        this.segments.push(seg);
        this.sprite.addChild(seg);
    }
}
