import { Container, Text } from "pixi.js";

export class Overlay {
    public container: Container;
    private scoreText: Text;

    constructor() {
        this.container = new Container();
        this.scoreText = new Text({
            text: "Score: 0",
            style: {
                fontFamily: "monospace",
                fontSize: 20,
                fill: "white",
            }
        });
        this.container.addChild(this.scoreText);
    }

    public setScore(score: number) {
        this.scoreText.text = `Score: ${Math.floor(score)}`;
    }

    public resize(screenWidth: number, screenHeight: number) {
        this.scoreText.position.set(10, screenHeight - this.scoreText.height - 10);
    }
}
