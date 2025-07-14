import { Container, Graphics, Point } from "pixi.js";
import { Orb } from "./Orb";
import { Player } from "./Player";

export const WORLD_RADIUS = 2000;
const N_ORBS = 250;

export class World {
    public container: Container;
    private background: Graphics;
    private orbs: Orb[] = [];

    constructor() {
        this.container = new Container();

        this.background = new Graphics().circle(0, 0, WORLD_RADIUS).fill(0x161c22);
        this.container.addChild(this.background);

        this.spawnOrbs(N_ORBS);
    }

    private spawnOrbs(nOrbs: number) {
        for (let i = 0; i < nOrbs; ++i) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * (WORLD_RADIUS - 10);

            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            const orb = new Orb(x, y, Math.floor(Math.random() * 6) + 6);
            this.orbs.push(orb);
            this.container.addChild(orb);
        }

    }

    public setPosition(center: Point) {
        this.container.position.copyFrom(center);
    }

    public add(et: Graphics) {
        this.container.addChild(et);
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

    public update(player: Player, delta: number, onScoreUpdate?: (score: number) => void) {
        this.container.pivot.copyFrom(player.position);
        for (const orb of this.orbs) {
            orb.update(delta);
        }

        // Orb Collision Logic
        this.orbs = this.orbs.filter((orb) => {
            if (!orb.active) return;
            const collided = this.checkCollision(orb, player.position, player.radius);
            if (collided) {
                // Just flag the orbs instead of deleting
                // this.container.removeChild(orb);
                orb.active = false;
                orb.visible = false;

                player.updateScore(Math.floor(orb.getRadius() / 2));
                if (onScoreUpdate) onScoreUpdate(player.score);
            }
            return !collided;
        });
    }
}
