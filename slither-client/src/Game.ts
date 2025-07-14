import { Application, Point } from "pixi.js";
import { World } from "./World";
import { Player } from "./Player";
import { Input } from "./Input";

export class Game {
    private app: Application;
    private input!: Input;
    private world!: World;
    private player!: Player;
    private screenCenter: Point = new Point();

    constructor(app: Application) {
        this.app = app;
    }

    public async start(containerID: string = "pixi-container") {
        await this.app.init({ background: "", resizeTo: window });
        const container = document.getElementById(containerID);
        if (!container) throw new Error('Cannot initialize game. Container not found');
        container.appendChild(this.app.canvas);

        // For PIXI Debugger
        // remove on prod
        globalThis.__PIXI_APP__ = this.app;

        this.world = new World();
        this.app.stage.addChild(this.world.container);

        this.player = new Player();
        this.world.addEntity(this.player.sprite);

        this.input = new Input(this.app.canvas);

        this.updateScreenCenter();
        this.world.setPosition(this.screenCenter);

        window.addEventListener("resize", () => {
            this.updateScreenCenter();
            this.world.setPosition(this.screenCenter);
        });

        this.app.ticker.add((delta) => this.render(delta.deltaTime));
    }
    
    private updateScreenCenter() {
        this.screenCenter.set(this.app.screen.width / 2, this.app.screen.height / 2);
    }

    private render(delta: number) {
        this.player.update(this.input.mousePos, this.screenCenter);
        this.world.update(this.player.sprite.position, delta);
    }
}
