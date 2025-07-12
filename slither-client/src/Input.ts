import { Point } from "pixi.js";

export const input = {
    up: false,
    down: false,
    left: false,
    right: false,
};

export const mousePos = new Point();

export function setupInput(canvas: HTMLCanvasElement) {
    // window.addEventListener("keydown", (e) => setKey(e.key.toLowerCase(), true));
    // window.addEventListener("keyup", (e) => setKey(e.key.toLowerCase(), false));

    canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        mousePos.set(e.clientX - rect.left, e.clientY - rect.top);
        console.log(`Client Coords: (${e.clientX}, ${e.clientY})`);
        console.log(`Calculated Coords: (${mousePos.x}, ${mousePos.y})`);
    });
}

// function setKey(key: string, value: boolean) {
//     switch (key) {
//         case "w":
//         case "arrowup":
//             input.up = value;
//             break;
//         case "s":
//         case "arrowdown":
//             input.down = value;
//             break;
//         case "a":
//         case "arrowleft":
//             input.left = value;
//             break;
//         case "d":
//         case "arrowright":
//             input.right = value;
//             break;
//     }
// }
