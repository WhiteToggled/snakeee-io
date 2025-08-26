import { OrbManager } from "../core/OrbManager";
import * as constants from "../../shared/models/constants";
import { OrbState } from "../../shared/models/orb_state";

describe("OrbManager", () => {
  let orbManager: OrbManager;

  beforeEach(() => {
    orbManager = new OrbManager();
  });

  it("initializes with TOTAL_ORBS orbs", () => {
    // Internal orbs array should always be TOTAL_ORBS in length at least
    const allOrbs = (orbManager as any).orbs as OrbState[];
    expect(allOrbs.length).toBeGreaterThanOrEqual(constants.TOTAL_ORBS);
  });

  it("activates INITIAL_ACTIVE_ORBS at the start", () => {
    const activeOrbs = orbManager.getActiveOrbs();
    expect(activeOrbs.length).toBe(constants.INITIAL_ACTIVE_ORBS);
    activeOrbs.forEach((orb) => {
      expect(orb.active).toBe(true);
    });
  });

  it("spawns a new orb at given coordinates", () => {
    const x = 123;
    const y = -456;
    orbManager.spawnOrb(x, y, 20);

    const orb = orbManager.getActiveOrbs().find((o) => o.x === x && o.y === y);
    expect(orb).toBeDefined();
    expect(orb!.radius).toBe(20);
    expect(orb!.active).toBe(true);
  });

  it("reuses inactive orbs when spawning", () => {
    const orb = orbManager.getActiveOrbs()[0];
    orbManager.killOrb(orb);

    // Should now respawn that orb instead of creating a new one
    orbManager.spawnOrb(50, 60, 10);
    expect(orb.active).toBe(true);
    expect(orb.x).toBe(50);
    expect(orb.y).toBe(60);
  });

  it("adds orb to respawn queue when killed", () => {
    const orb = orbManager.getActiveOrbs()[0];
    orbManager.killOrb(orb);

    expect(orb.active).toBe(false);
    const respawnQueue = (orbManager as any).respawnQueue as any[];
    expect(respawnQueue.length).toBe(1);
    expect(respawnQueue[0].orb).toBe(orb);
    expect(respawnQueue[0].timer).toBe(constants.RESPAWN_DELAY);
  });

  it("respawns orb after respawn delay", () => {
    const orb = orbManager.getActiveOrbs()[0];
    orbManager.killOrb(orb);

    // simulate enough time passing
    orbManager.update(constants.RESPAWN_DELAY * 60);

    expect(orb.active).toBe(true);
    const respawnQueue = (orbManager as any).respawnQueue as any[];
    expect(respawnQueue.length).toBe(0);
  });

  it("respawned orbs have new random positions", () => {
    const orb = orbManager.getActiveOrbs()[0];
    orbManager.killOrb(orb);

    const oldX = orb.x;
    const oldY = orb.y;

    orbManager.update(constants.RESPAWN_DELAY * 60);

    expect(orb.active).toBe(true);
    expect(orb.x).not.toBe(oldX);
    expect(orb.y).not.toBe(oldY);
  });

  it("can keep spawning beyond initial TOTAL_ORBS", () => {
    // Deactivate all orbs first
    orbManager.getActiveOrbs().forEach((o) => orbManager.killOrb(o));

    // Spawn more than TOTAL_ORBS to force creation of new orbs
    for (let i = 0; i < constants.TOTAL_ORBS + 5; i++) {
      orbManager.spawnOrb(i, i, 5);
    }

    const allOrbs = (orbManager as any).orbs as OrbState[];
    expect(allOrbs.length).toBeGreaterThan(constants.TOTAL_ORBS);
  });

  it("returns only active orbs from getActiveOrbs", () => {
    const orb = orbManager.getActiveOrbs()[0];
    orbManager.killOrb(orb);

    expect(orbManager.getActiveOrbs().includes(orb)).toBe(false);
  });
});

