import { Container, Point } from "pixi.js";
import { Orb } from "./Orb";
import { Player } from "./Player";
import { WORLD_RADIUS } from "./World";

const TOTAL_ORBS = 1000;
const INITIAL_ACTIVE_ORBS = 250;
const INIT_CHUNK_SIZE = 100;
const INIT_DELAY_MS = 10;

interface RespawnTimer {
    orb: Orb;
    timer: number;
}
const RESPAWN_DELAY = 5;

export class OrbPool {
    private orbs: Orb[] = [];
    private respawnQueue: RespawnTimer[] = [];
    public container: Container;

    constructor() {
        this.container = new Container();
    }

    private createRandomOrb(): Orb {
        const orbRadius = Math.floor(Math.random() * 6) + 6;
        const orb = new Orb(-9999, -9999, orbRadius);
        orb.active = false;
        orb.visible = false; // hide until used
        return orb;
    }

    private getRandomPosition(): Point {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * (WORLD_RADIUS - 10);
        return new Point(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }

    public async initializeAsync() {
        for (let i = 0; i < TOTAL_ORBS; i += INIT_CHUNK_SIZE) {
            const chunk = Math.min(INIT_CHUNK_SIZE, TOTAL_ORBS - i);
            for (let j = 0; j < chunk; ++j) {
                const orb = this.createRandomOrb();
                this.orbs.push(orb);
                this.container.addChild(orb);
            }

            await new Promise(resolve => setTimeout(resolve, INIT_DELAY_MS));
        }

        this.activateInitialOrbs(INITIAL_ACTIVE_ORBS);
    }

    private activateInitialOrbs(count: number) {
        for (let i = 0; i < count; ++i) {
            const orb = this.orbs[i];
            const pos = this.getRandomPosition();
            orb.position.set(pos.x, pos.y);
            orb.active = true;
            orb.visible = true;
        }
    }

    private checkCollision(orb: Orb, playerPos: Point, playerRadius: number): boolean {
        const dx = orb.x - playerPos.x;
        const dy = orb.y - playerPos.y;
        const distSq = dx*dx + dy*dy;

        const minDist = playerRadius + orb.getRadius();
        if (distSq <= (minDist*minDist)) {
            // console.log(`Orb: (${orb.x}, ${orb.y}), (${playerPos.x}, ${playerPos.y})`);
            return true;
        }
        return false;
    }

    public spawnOrb(x: number, y: number, radius: number = 5) {
        let orb = this.orbs.find(o => !o.active);

        if (!orb) {
            // create more
            orb = this.createRandomOrb();
            this.orbs.push(orb);
            this.container.addChild(orb);
        } else {
            const index = this.respawnQueue.findIndex(entry => entry.orb === orb);
            if (index !== -1) this.respawnQueue.splice(index, 1);
        }

        orb.position.set(x, y);
        orb.active = true;
        orb.visible = true;
        orb.setRadius(radius);
    }

    public update(delta: number, player: Player) {
        for (let i = this.respawnQueue.length - 1; i >= 0; --i) {
            const entry = this.respawnQueue[i];
            entry.timer -= delta / 60;
            if (entry.timer <= 0) {
                this.respawnOrb(entry.orb);
                this.respawnQueue.splice(i, 1);
            }
        }

        for (const orb of this.orbs) {
            if (orb.active && this.checkCollision(orb, player.position, player.radius)) {
                orb.kill();
                this.respawnQueue.push({ orb, timer: RESPAWN_DELAY });
                player.updateScore(Math.floor(orb.getRadius() / 2));
            }
        }
    }

    private respawnOrb(orb: Orb) {
        const pos = this.getRandomPosition();
        orb.position.set(pos.x, pos.y);
        orb.active = true;
        orb.visible = true;
    }

    public getActiveOrbs(): Orb[] {
        return this.orbs.filter(orb => orb.active);
    }

    public getContainer(): Container {
        return this.container;
    }
}

