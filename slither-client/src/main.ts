import { Application, Point } from "pixi.js";
import { createWorld } from "./World.ts";
import { createPlayer, updatePlayer } from "./Player.ts";
import { setupInput } from "./Input.ts";

const app = new Application();

(async () => {
    await setup();
    await preload();
})();

async function setup() {
    await app.init({ background: "", resizeTo: window });
    document.getElementById('pixi-container')?.appendChild(app.canvas);

    // For PIXI Debugger
    // remove on prod
    globalThis.__PIXI_APP__ = app;

    setupInput(app.canvas);

    const world = createWorld();
    const player = createPlayer();
    world.addChild(player);
    app.stage.addChild(world);

    world.position.set(app.screen.width / 2, app.screen.height / 2);
    window.addEventListener("resize", () => {
        world.position.set(app.screen.width / 2, app.screen.height / 2);
    });

    // Disable Zoom
    window.addEventListener("wheel", (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
        }
    }, { passive: false });
    window.addEventListener("keydown", (e) => {
        if (e.ctrlKey &&
            (e.key === '+' || e.key === '-' || e.key === '=')) {
            e.preventDefault();
        }
    });

    world.pivot.copyFrom(player.position);

    app.ticker.add(() => {
        const screenCenter = new Point(
            app.screen.width / 2,
            app.screen.height / 2
        );
        updatePlayer(screenCenter, player);
        world.pivot.copyFrom(player.position);
    });
}

async function preload() {
    // preload assets if required
}
