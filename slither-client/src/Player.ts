import { Graphics, Point } from "pixi.js";
import { mousePos } from "./Input.ts";

export const PLAYER_RADIUS = 20;
export const PLAYER_SPEED = 5;
export const DEADZONE = 1;

export function createPlayer(): Graphics {
    const player = new Graphics().circle(0, 0, PLAYER_RADIUS).fill("white");
    return player;
}

export function updatePlayer(appCenter: Point, player: Graphics) {
    // For singleplayer testing
    if (document.hasFocus()) {
        const dx = mousePos.x - appCenter.x;
        const dy = mousePos.y - appCenter.y;
        const len = Math.sqrt(dx * dx + dy * dy);

        if (len > DEADZONE) {
            const nx = dx / len;
            const ny = dy / len;

            player.x += nx * PLAYER_SPEED;
            player.y += ny * PLAYER_SPEED;
        }
    }
}

// Keyboard inputs
// export function updatePlayer(
//     input: {
//         up: boolean;
//         down: boolean;
//         left: boolean;
//         right: boolean;
//     },
//     player: Graphics,
// ) {
//     if (input.up) player.y -= PLAYER_SPEED;
//     if (input.down) player.y += PLAYER_SPEED;
//     if (input.left) player.x -= PLAYER_SPEED;
//     if (input.right) player.x += PLAYER_SPEED;
// }
