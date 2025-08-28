import { OrbState } from "../../shared/models/orb_state";
import * as constants from "../../shared/models/constants";
import { EventEmitter } from "stream";

interface RespawnTimer {
    orb: OrbState;
    timer: number;
}

export class OrbManager extends EventEmitter {
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
        super();
        for (let i = 0; i < constants.TOTAL_ORBS; i++) {
            const orb = this.createOrb();
            this.orbs.push(orb);
        }

        // Activate some at start
        this.activateInitialOrbs(constants.INITIAL_ACTIVE_ORBS);
    }

    private createOrb(): OrbState {
        const orbRadius = Math.floor(Math.random() * 4) + 6;
        return {
            id: this.nextId++,
            coords: [-9999, -9999],
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
            orb.coords[0] = pos.x;
            orb.coords[1] = pos.y;
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

        orb.coords[0] = x;
        orb.coords[1] = y;
        orb.radius = radius;
        orb.active = true;
        console.log(`Spawn: ${orb.coords[0]}, ${orb.coords[1]}\n`);
        this.emit("orb_spawn", orb);
    }


    public killOrb(orb: OrbState) {
        orb.active = false;
        this.respawnQueue.push({ orb, timer: constants.RESPAWN_DELAY });
        this.emit("orb_despawn", orb);
    }


    private respawnOrb(orb: OrbState) {
        const pos = this.getRandomPosition();
        orb.coords[0] = pos.x;
        orb.coords[1] = pos.y;
        orb.active = true;
        this.emit("orb_spawn", orb);
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
