import { Point } from "pixi.js";

export class Input {
    public mousePos: Point = new Point();
    public mouseDown: boolean = false;

    constructor(canvas: HTMLCanvasElement) {

        canvas.addEventListener("mousemove", (e) => {
            const rect = canvas.getBoundingClientRect();
            this.mousePos.set(e.clientX - rect.left, e.clientY - rect.top);

            // Debug
            // console.log(`Client Coords: (${e.clientX}, ${e.clientY})`);
            // console.log(`Canvas Coords: (${mousePos.x}, ${mousePos.y})`);
        });

        canvas.addEventListener("mousedown", (e) => {
            if (e.button === 0) this.mouseDown = true;
        });
        canvas.addEventListener("mouseup", (e) => {
            if (e.button === 0) this.mouseDown = false;
        });
        canvas.addEventListener("mouseup", () => {
            this.mouseDown = false;
        })
    }

}
