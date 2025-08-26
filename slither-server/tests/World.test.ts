import { World } from "../core/World";
import { Player } from "../core/Player";
import { OrbManager } from "../core/OrbManager";
import * as constants from "../../shared/models/constants";

describe("World", () => {
    let world: World;
    let orbManager: OrbManager;

    beforeEach(() => {
        world = new World();
        orbManager = world.getOrbManager();
        orbManager["orbs"] = []; // clear all orbs
        orbManager.spawnOrb(0, 0, 10); // one orb at center
    });

    test("player collects orb when colliding", () => {
        const player = new Player("p1");
        player.setInput({ x: 0, y: 0 }, false);
        player.updateScore(0); // set base score

        // Move player directly onto orb
        player["position"] = { x: 0, y: 0 };

        world.update([player], 1);

        expect(orbManager.getActiveOrbs().length).toBe(0); // orb removed
        expect(player.score).toBeGreaterThan(constants.MIN_SCORE); // gained points
    });

    test("player does not collect orb if outside radius", () => {
        const player = new Player("p1");
        player["position"] = { x: 100, y: 100 };

        world.update([player], 1);

        expect(orbManager.getActiveOrbs().length).toBe(1); // still active
        expect(player.score).toBe(constants.MIN_SCORE); // unchanged
    });

    test("inactive player cannot collect orbs", () => {
        const player = new Player("p1");
        player.alive = false;
        player["position"] = { x: 0, y: 0 };

        world.update([player], 1);

        expect(orbManager.getActiveOrbs().length).toBe(1); // orb not eaten
    });

    test("player dies when head collides with another player's body", () => {
        const p1 = new Player("p1");
        const p2 = new Player("p2");

        // Place p1 head overlapping p2's first segment
        p1["position"] = { x: 0, y: 0 };
        p2["segmentPositions"][0] = { x: 0, y: 0 };

        world.update([p1, p2], 1);

        expect(p1.alive).toBe(false);
        expect(p2.alive).toBe(true);
    });

    test("no self-collision with own body", () => {
        const p1 = new Player("p1");

        // Place head overlapping its own body segment
        p1["position"] = { x: 0, y: 0 };
        p1["segmentPositions"][1] = { x: 0, y: 0 };

        world.update([p1], 1);

        expect(p1.alive).toBe(true); // shouldn’t kill itself
    });

    test("inactive orbs do not cause collisions", () => {
        const orb = orbManager.getActiveOrbs()[0];
        orb.active = false;

        const player = new Player("p1");
        player["position"] = { x: 0, y: 0 };

        world.update([player], 1);

        expect(player.score).toBe(constants.MIN_SCORE);
    });

    test("player dies and drops orbs on collision", () => {
        const p1 = new Player("p1");
        const p2 = new Player("p2");

        p1.updateScore(20); // big player
        p1["position"] = { x: 0, y: 0 };
        p2["segmentPositions"][0] = { x: 0, y: 0 };

        world.update([p1, p2], 1);

        expect(p1.alive).toBe(false);

        // Drops at least 1 orb
        expect(orbManager.getActiveOrbs().length).toBeGreaterThan(1);
    });
});
