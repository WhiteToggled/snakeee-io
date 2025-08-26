import { OrbManager } from "./OrbManager";

import { PlayerState } from "../../shared/models/player_state";
import { InputMessage } from "../../shared/types/messages";
import * as constants from "../../shared/models/constants";

export class Player {
    public id: string;

    private position: { x: number; y: number } = { x: 0, y: 0 };
    private direction: { x: number; y: number } = { x: 1, y: 0 };
    private segmentPositions: { x: number; y: number }[] = [];

    public scale: number = 1;
    public color: number;
    public score: number = constants.MIN_SCORE;
    public isBoosting: boolean = false;
    public alive: boolean = true;
    private respawnTimer?: number;

    private input: InputMessage = { mousePos: { x: 0, y: 0 }, mouseDown: false };

    constructor(id: string) {
        this.id = id;
        this.color = Math.floor(Math.random() * 0xffffff);

        this.segmentPositions.push({ x: 0, y: 0 });
        for (let i = 0; i < constants.BASE_LENGTH; ++i) {
            this.addSegment();
        }
    }

    public get radius(): number {
        return constants.BASE_RADIUS * this.scale;
    }

    public get state(): PlayerState {
        return {
            id: this.id,
            position: { ...this.position },
            direction: { ...this.direction },
            radius: this.radius,
            scale: this.scale,
            score: this.score,
            color: this.color,
            isBoosting: this.isBoosting,
            alive: this.alive,
            segmentPositions: this.segmentPositions.map((p) => ({ x: p.x, y: p.y })),
            respawnTimer: this.respawnTimer,
        };
    }

    public setInput(mousePos: { x: number; y: number }, mouseDown: boolean) {
        this.input = { mousePos, mouseDown };
    }

    public updateScore(amount: number = 1) {
        this.score = Math.max(constants.MIN_SCORE, this.score + amount);
        this.scale = 1 + Math.sqrt(this.score - constants.MIN_SCORE) * constants.SCALE_FACTOR;

        const desiredSegmentCount =
            constants.BASE_LENGTH + Math.floor((this.score - constants.MIN_SCORE) * constants.GROWTH_PER_SCORE);

        while (this.segmentPositions.length < desiredSegmentCount) {
            this.addSegment();
        }
        while (this.segmentPositions.length > desiredSegmentCount) {
            this.segmentPositions.pop();
        }
    }

    private addSegment() {
        const lastPos =
            this.segmentPositions.length > 0
                ? this.segmentPositions[this.segmentPositions.length - 1]
                : this.position;
        this.segmentPositions.push({ x: lastPos.x, y: lastPos.y });
    }

    private getRandomSpawn(): { x: number; y: number } {
        const spawnRadius = constants.WORLD_RADIUS * 0.8; // keeps players inside world
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * spawnRadius;
        return { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
    }


    public die(orbManager: OrbManager) {
        this.alive = false;
        this.respawnTimer = 3;

        const dropCount = Math.floor(this.score / 8);
        for (let i = 0; i < dropCount; ++i) {
            const t = i / dropCount;
            const index = Math.floor(t * (this.segmentPositions.length - 1));
            const pos = this.segmentPositions[index];

            const jitterX = (Math.random() - 0.5) * 10;
            const jitterY = (Math.random() - 0.5) * 10;

            orbManager.spawnOrb(pos.x + jitterX, pos.y + jitterY);
        }

        // const pos = this.getRandomSpawn();
        // this.position = pos;
        //
        // for (let i = 0; i < this.segmentPositions.length; ++i) {
        //     this.segmentPositions[i] = { ...pos };
        // }

        this.score = constants.MIN_SCORE;
        this.updateScore(0);
    }

    private tryRespawn(delta: number) {
        if (!this.alive && this.respawnTimer !== undefined) {
            this.respawnTimer -= delta / 60; // assuming delta ~ frames
            if (this.respawnTimer <= 0) {
                this.alive = true;
                this.respawnTimer = undefined;

                const pos = this.getRandomSpawn();
                this.position = pos;
                this.segmentPositions = [{ ...pos }];
                for (let i = 0; i < constants.BASE_LENGTH; ++i) this.addSegment();
            }
        }
    }

    public update(orbManager: OrbManager, delta: number) {
        if (!this.alive) {
            this.tryRespawn(delta);
            return;
        }

        // Boosting logic
        this.isBoosting = this.input.mouseDown && this.score > constants.MIN_SCORE;
        if (this.isBoosting) {
            const drain = -(constants.BOOST_DRAIN * delta) / 60;
            this.updateScore(drain);
            if (this.score === constants.MIN_SCORE) this.isBoosting = false;
        }

        // normalized direction vector
        const dir = this.input.mousePos;

        if (Math.abs(dir.x) > 1e-3 || Math.abs(dir.y) > 1e-3) {
            // Smooth turning
            const turnSpeed = 0.15;
            this.direction.x = this.direction.x * (1 - turnSpeed) + dir.x * turnSpeed;
            this.direction.y = this.direction.y * (1 - turnSpeed) + dir.y * turnSpeed;

            // Re-normalize
            const len = Math.sqrt(this.direction.x * this.direction.x + this.direction.y * this.direction.y);
            if (len > 0) {
                this.direction.x /= len;
                this.direction.y /= len;
            }

            const speed = this.isBoosting ? constants.PLAYER_SPEED * 2 : constants.PLAYER_SPEED;
            this.position.x += this.direction.x * speed;
            this.position.y += this.direction.y * speed;
        }

        // Update head
        this.segmentPositions[0] = { x: this.position.x, y: this.position.y };

        // Boundary check
        const distToCenter = Math.hypot(this.position.x, this.position.y);
        if (distToCenter - this.radius > constants.WORLD_RADIUS) {
            this.die(orbManager);
            return;
        }

        // Update body segments
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
        }
    }
}
