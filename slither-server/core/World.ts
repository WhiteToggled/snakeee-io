import { OrbManager } from "./OrbManager";
import { Player } from "./Player";

import { OrbState } from "../../shared/models/orb_state";

export class World {
    private orbManager: OrbManager;

    constructor() {
        this.orbManager = new OrbManager();
    }

    public getOrbManager(): OrbManager {
        return this.orbManager;
    }

    public getOrbs(): OrbState[] {
        return this.orbManager.state;
    }

    // Handles collisions
    public update(players: Player[], delta: number) {
        this.orbManager.update(delta);

        // player-orb collisions
        for (const player of players) {
            if (!player.alive) continue;

            for (const orb of this.orbManager.getActiveOrbs()) {
                if (!orb.active) continue;

                const dx = orb.coords[0] - player.state.position[0];
                const dy = orb.coords[1] - player.state.position[1];
                const distSq = dx * dx + dy * dy;
                const r = orb.radius + player.radius;

                if (distSq < r * r) {
                    this.orbManager.killOrb(orb);
                    player.updateScore(Math.floor(orb.radius / 2));
                }
            }
        }

        // const deadPlayers = new Set<Player>();

        // player-player collisions
        for (const a of players) {
            if (!a.alive) continue;

            for (const b of players) {
                if (a === b || !b.alive) continue;

                // Skip if player a is tiny (can’t kill anyone)
                // if (a.radius < constants.BASE_RADIUS * 0.5) continue;

                // Check collision against each body segment of b
                // for (const seg of b.state.segmentPositions) {
                for (let i = 1; i < b.segmentPositions.length; ++i) {
                    const seg = b.segmentPositions[i];
                    const dx = seg.x - a.state.position[0];
                    const dy = seg.y - a.state.position[1];
                    const distSq = dx * dx + dy * dy;
                    const r = a.radius;

                    if (distSq < r * r) {
                        // Player a hit b's body → a dies
                        // deadPlayers.add(a);
                        a.die(this.orbManager);
                        break;
                    }
                }
            }
        }

        // for (const p of deadPlayers) {
        //     p.die(this.orbManager);
        // }
    }
}
