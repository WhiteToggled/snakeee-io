import { Application } from "pixi.js";
import { Game } from "./Game";

const app = new Application();
const game = new Game(app);

(async () => {
    await preload();
    await game.start("pixi-container");

    // Server connection
    await game.connect("ws://localhost:8080");
})();

async function preload() {
    // preload assets if required
}

// Disable Zoom
window.addEventListener("wheel", (e) => {
    if (e.ctrlKey) {
        e.preventDefault();
    }
}, { passive: false });
window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && ['+', '-', '='].includes(e.key)) {
        e.preventDefault();
    }
});
