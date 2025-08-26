import { Player } from "../core/Player";
import { OrbManager } from "../core/OrbManager";
import * as constants from "../../shared/models/constants";

describe("Player", () => {
  let player: Player;
  let orbManager: OrbManager;

  beforeEach(() => {
    orbManager = new OrbManager();
    player = new Player("test-player");
  });

  it("initializes with base score, scale, and segments", () => {
    expect(player.score).toBe(constants.MIN_SCORE);
    expect(player.scale).toBe(1);
    expect(player.state.segmentPositions.length).toBe(
      constants.BASE_LENGTH + 1 // +1 because of initial head
    );
    expect(player.alive).toBe(true);
  });

  it("computes radius from scale", () => {
    expect(player.radius).toBe(constants.BASE_RADIUS);
    player.updateScore(10);
    expect(player.radius).toBeGreaterThan(constants.BASE_RADIUS);
  });

  it("increases score and scale when eating", () => {
    const initialLength = player.state.segmentPositions.length;
    player.updateScore(20);
    expect(player.score).toBe(constants.MIN_SCORE + 20);
    expect(player.scale).toBeGreaterThan(1);
    expect(player.state.segmentPositions.length).toBeGreaterThan(initialLength);
  });

  it("reduces segment count when score decreases", () => {
    player.updateScore(50);
    const longerLength = player.state.segmentPositions.length;

    player.updateScore(-40);
    expect(player.state.segmentPositions.length).toBeLessThan(longerLength);
  });

  it("dies and drops orbs proportional to score", () => {
    player.updateScore(80);
    const spawnSpy = jest.spyOn(orbManager, "spawnOrb");

    player.die(orbManager);
    expect(player.alive).toBe(false);
    expect(spawnSpy).toHaveBeenCalled();
    expect(spawnSpy).toHaveBeenCalledTimes(Math.floor((constants.MIN_SCORE + 80) / 8));
  });

  it("resets position and score on death", () => {
    player.updateScore(30);
    player.die(orbManager);

    expect(player.score).toBe(constants.MIN_SCORE);
    expect(player.state.position).toEqual({ x: 0, y: 0 });
    expect(player.state.segmentPositions.every((p) => p.x === 0 && p.y === 0)).toBe(true);
  });

  it("respawns after respawn timer expires", () => {
    player.die(orbManager);
    expect(player.alive).toBe(false);

    // simulate enough delta frames
    player.update(orbManager, 3 * 60 + 1);
    expect(player.alive).toBe(true);
    expect(player.state.respawnTimer).toBeUndefined();
    expect(player.state.segmentPositions.length).toBe(constants.BASE_LENGTH + 1);
  });

  it("updates direction and position based on input", () => {
    player.setInput({ x: 100, y: 0 }, false);
    const oldX = player.state.position.x;

    player.update(orbManager, 1);
    expect(player.state.position.x).toBeGreaterThan(oldX);
    expect(player.state.direction.x).toBeCloseTo(1);
  });

  it("stays still if input inside deadzone", () => {
    player.setInput({ x: 0.5, y: 0.5 }, false);
    const oldPos = { ...player.state.position };

    player.update(orbManager, 1);
    expect(player.state.position).toEqual(oldPos);
  });

  it("dies when leaving world bounds", () => {
    player.setInput({ x: 99999, y: 0 }, false);

    // force move far outside
    for (let i = 0; i < 1000; i++) {
      player.update(orbManager, 1);
      if (!player.alive) break;
    }

    expect(player.alive).toBe(false);
  });

  it("updates segments to maintain spacing", () => {
    player.setInput({ x: 1000, y: 0 }, false);
    player.update(orbManager, 1);

    const segments = player.state.segmentPositions;
    for (let i = 1; i < segments.length; i++) {
      const dx = segments[i - 1].x - segments[i].x;
      const dy = segments[i - 1].y - segments[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      expect(dist).toBeLessThanOrEqual(constants.SEGMENT_SPACING + 0.1);
    }
  });

  it("enters boosting mode when mouseDown and score > MIN_SCORE", () => {
    player.updateScore(10);
    player.setInput({ x: 100, y: 0 }, true);

    const prevScore = player.score;
    player.update(orbManager, 60); // simulate 1 sec
    expect(player.isBoosting).toBe(true);
    expect(player.score).toBeLessThan(prevScore);
  });

  it("cannot boost at minimum score", () => {
    player.setInput({ x: 100, y: 0 }, true);

    player.update(orbManager, 60);
    expect(player.isBoosting).toBe(false);
    expect(player.score).toBe(constants.MIN_SCORE);
  });


  // Movement

  it("movement: updates direction and position based on input", () => {
    player.setInput({ x: 100, y: 0 }, false);
    const oldX = player.state.position.x;

    player.update(orbManager, 1);
    expect(player.state.position.x).toBeGreaterThan(oldX);
    expect(player.state.direction.x).toBeCloseTo(1);
  });

  it("movement: stays still if input inside deadzone", () => {
    player.setInput({ x: constants.DEADZONE / 2, y: 0 }, false);
    const oldPos = { ...player.state.position };

    player.update(orbManager, 1);
    expect(player.state.position).toEqual(oldPos);
  });

  it("movement: moves faster when boosting", () => {
    player.updateScore(10); // allow boosting
    player.setInput({ x: 100, y: 0 }, false);

    player.update(orbManager, 1);
    const normalX = player.state.position.x;

    // reset
    player["position"] = { x: 0, y: 0 };
    player.setInput({ x: 100, y: 0 }, true);

    player.update(orbManager, 1);
    const boostX = player.state.position.x;

    expect(boostX).toBeGreaterThan(normalX);
    expect(boostX).toBeCloseTo(normalX * 2, 0);
  });

  it("movement: dead player does not move", () => {
    player.setInput({ x: 100, y: 0 }, false);

    player.die(orbManager);
    const start = { ...player.state.position };

    player.update(orbManager, 1);
    expect(player.state.position).toEqual(start);
  });

  it("movement: updates position consistently across multiple ticks", () => {
    player.setInput({ x: 0, y: 100 }, false);

    const startY = player.state.position.y;
    for (let i = 0; i < 5; i++) {
      player.update(orbManager, 1);
    }

    expect(player.state.position.y).toBeGreaterThan(startY);
    expect(player.state.position.x).toBeCloseTo(0, 5);
  });

  it("movement: dies when leaving world bounds", () => {
    player["position"] = { x: constants.WORLD_RADIUS + 100, y: 0 };
    player.setInput({ x: constants.WORLD_RADIUS * 2, y: 0 }, false);

    player.update(orbManager, 1);
    expect(player.alive).toBe(false);
  });

  it("movement: updates segments to maintain spacing", () => {
    player.setInput({ x: 1000, y: 0 }, false);
    player.update(orbManager, 1);

    const segments = player.state.segmentPositions;
    for (let i = 1; i < segments.length; i++) {
      const dx = segments[i - 1].x - segments[i].x;
      const dy = segments[i - 1].y - segments[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      expect(dist).toBeLessThanOrEqual(constants.SEGMENT_SPACING + 0.1);
    }
  });

  it("movement: enters boosting mode when mouseDown and score > MIN_SCORE", () => {
    player.updateScore(10);
    player.setInput({ x: 100, y: 0 }, true);

    const prevScore = player.score;
    player.update(orbManager, 60); // simulate 1 sec
    expect(player.isBoosting).toBe(true);
    expect(player.score).toBeLessThan(prevScore);
  });

  it("movement: cannot boost at minimum score", () => {
    player.setInput({ x: 100, y: 0 }, true);

    player.update(orbManager, 60);
    expect(player.isBoosting).toBe(false);
    expect(player.score).toBe(constants.MIN_SCORE);
  });
});
