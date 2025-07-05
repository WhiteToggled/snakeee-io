import { Application, Graphics } from "pixi.js";

declare global {
    interface Window {
        __PIXI_APP__ ?: Application;
    }
}

(async () => {
    // Create a new application
    const app = new Application();

    window.__PIXI_APP__ = app;

    // Initialize the application
    await app.init({ background: "#161c22", resizeTo: window });
    // Append the application canvas to the document body
    document.getElementById("pixi-container")!.appendChild(app.canvas);

    // Create a circle player
    const player = new Graphics().circle(0, 0, 10).fill('red');

    // Move the player to the center of the screen
    player.position.set(app.screen.width / 2, app.screen.height / 2);
    // Add the player to the stage
    app.stage.addChild(player);

    // Mouse Position
    let mouseX = player.x;
    let mouseY = player.y;

    window.addEventListener("mousemove", (e) => {
        if (document.hasFocus()) {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // console.log(`(${mouseX}, ${mouseY})`);
        }

    })

    const speed = 6;
    const deadZone = 4;
    
    app.ticker.add(() => {
        const dx = mouseX - player.x;
        const dy = mouseY - player.y;
        const dist = Math.hypot(dx, dy);

        if (dist > deadZone) {
            player.x += (dx / dist) * speed;
            player.y += (dy / dist) * speed;
        }
    });

})();
