import { Container } from "pixi.js";
import { Orb } from "./Orb";
import { OrbState } from "../../shared/models/orb_state";

import { TOTAL_ORBS, INIT_CHUNK_SIZE, INIT_DELAY_MS } from "../../shared/models/constants";

export class OrbPool {
    private orbs: Orb[] = [];
    public container: Container;

    constructor() {
        this.container = new Container();
    }

    public async initializeAsync() {
        for (let i = 0; i < TOTAL_ORBS; i += INIT_CHUNK_SIZE) {
            const chunk = Math.min(INIT_CHUNK_SIZE, TOTAL_ORBS - i);
            for (let j = 0; j < chunk; ++j) {
                const orb = new Orb(0, 0, 5);
                this.orbs.push(orb);
                this.container.addChild(orb);
            }

            await new Promise((resolve) => setTimeout(resolve, INIT_DELAY_MS));
        }
    }

    public updateFromServer(orbStates: OrbState[]) {
        // create missing Orb graphics if needed
        while (this.orbs.length < orbStates.length) {
            const orb = new Orb(0, 0, 5); // initial radius will be overridden
            this.orbs.push(orb);
            this.container.addChild(orb);
        }

        // update all orbs to match server state
        for (let i = 0; i < orbStates.length; i++) {
            const state = orbStates[i];
            const orb = this.orbs[i];
            orb.position.set(state.x, state.y);
            orb.setRadius(state.radius);
            orb.active = state.active;
            orb.visible = state.active;
            orb.clear();
            orb.circle(0, 0, 5).fill(state.color);
        }
    }

    public getContainer(): Container {
        return this.container;
    }
}
