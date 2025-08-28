import { Container } from "pixi.js";
import { Orb } from "./Orb";
import { OrbState } from "../../shared/models/orb_state";

import { INIT_CHUNK_SIZE, INIT_DELAY_MS } from "../../shared/models/constants";

export class OrbPool {
    private orbs: Map<number, Orb> = new Map(); // key by orb ID
    public container: Container;

    constructor() {
        this.container = new Container();
    }

    public spawnOrb(state: OrbState) {
        if (this.orbs.has(state.id)) return; // already exists

        const orb = new Orb(0, 0, 5); // initial radius, will override
        orb.id = state.id;
        orb.position.set(state.coords[0], state.coords[1]);
        orb.setRadius(state.radius);
        orb.active = state.active;
        orb.visible = state.active;
        orb.clear();
        orb.circle(0, 0, state.radius).fill(state.color);

        this.orbs.set(state.id, orb);
        this.container.addChild(orb);
    }

    public despawnOrb(id: number) {
        const orb = this.orbs.get(id);
        if (!orb) return;

        orb.kill();
    }

    public async spawnOrbsBatchAsync(orbStates: OrbState[]) {
        for (let i = 0; i < orbStates.length; i += INIT_CHUNK_SIZE) {
            const chunk = orbStates.slice(i, i + INIT_CHUNK_SIZE);
            for (const state of chunk) {
                this.spawnOrb(state);
            }
            await new Promise((resolve) => setTimeout(resolve, INIT_DELAY_MS));
        }
    }

    public updateOrb(state: OrbState) {
        const orb = this.orbs.get(state.id);
        if (!orb) return;

        orb.position.set(state.coords[0], state.coords[1]);
        orb.setRadius(state.radius);
        orb.active = state.active;
        orb.visible = state.active;
        orb.clear();
        orb.circle(0, 0, state.radius).fill(state.color);
    }

    public updateOrbs(states: OrbState[]) {
        for (const state of states) {
            this.updateOrb(state);
        }
    }

    public getContainer(): Container {
        return this.container;
    }
}
