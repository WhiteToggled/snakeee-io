import { OrbState } from "../../shared/models/orb_state";
import * as constants from "../../shared/models/constants";

interface RespawnTimer {
    orb: OrbState;
    timer: number;
}

export class OrbManager {
    private orbs: OrbState[] = [];
    private respawnQueue: RespawnTimer[] = [];
    private nextId: number = 0;

    public get state(): OrbState[] {
        return this.getActiveOrbs();
    }

    public getActiveOrbs(): OrbState[] {
        return this.orbs.filter(o => o.active);
    }

    constructor() {
        for (let i = 0; i < constants.TOTAL_ORBS; i++) {
            const orb = this.createOrb();
            this.orbs.push(orb);
        }

        // Activate some at start
        this.activateInitialOrbs(constants.INITIAL_ACTIVE_ORBS);
    }

    private createOrb(): OrbState {
        const orbRadius = Math.floor(Math.random() * 6) + 6;
        return {
            id: this.nextId++,
            x: -9999,
            y: -9999,
            radius: orbRadius,
            active: false,
            color: Math.floor(Math.random() * 0xffffff),
        };
    }

    private getRandomPosition(): { x: number; y: number } {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * (constants.WORLD_RADIUS - 10);
        return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
    }

    private activateInitialOrbs(count: number) {
        for (let i = 0; i < count; i++) {
            const orb = this.orbs[i];
            const pos = this.getRandomPosition();
            orb.x = pos.x;
            orb.y = pos.y;
            orb.active = true;
        }
    }

    public spawnOrb(x: number, y: number, radius: number = 5) {
        let orb = this.orbs.find(o => !o.active);

        if (!orb) {
            orb = this.createOrb();
            this.orbs.push(orb);
        } else {
            // Remove from respawn queue if waiting
            const idx = this.respawnQueue.findIndex(e => e.orb === orb);
            if (idx !== -1) this.respawnQueue.splice(idx, 1);
        }

        orb.x = x;
        orb.y = y;
        orb.radius = radius;
        orb.active = true;
    }


    public killOrb(orb: OrbState) {
        orb.active = false;
        this.respawnQueue.push({ orb, timer: constants.RESPAWN_DELAY });
    }


    private respawnOrb(orb: OrbState) {
        const pos = this.getRandomPosition();
        orb.x = pos.x;
        orb.y = pos.y;
        orb.active = true;
    }


    public update(delta: number) {
        for (let i = this.respawnQueue.length - 1; i >= 0; i--) {
            const entry = this.respawnQueue[i];
            entry.timer -= delta / 60;
            if (entry.timer <= 0) {
                this.respawnOrb(entry.orb);
                this.respawnQueue.splice(i, 1);
            }
        }
    }
}
