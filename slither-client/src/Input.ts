import { Point } from "pixi.js";

export class Input {
    private canvas: HTMLCanvasElement;
    public dir: Point = new Point(0, 0);   // normalized direction
    public mouseDown: boolean = false;    // boost flag

    private lastTapTime: number = 0;       // for double tap detection
    private doubleTapThreshold = 300;      // ms

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        // --- Desktop (mouse) ---
        canvas.addEventListener("mousemove", (e) => this.onMouseMove(e));
        canvas.addEventListener("mousedown", (e) => this.onMouseDown(e));
        canvas.addEventListener("mouseup", (e) => this.onMouseUp(e));

        // --- Mobile (touch) ---
        canvas.addEventListener("touchstart", (e) => this.onTouchStart(e), { passive: false });
        canvas.addEventListener("touchmove", (e) => this.onTouchMove(e), { passive: false });
        canvas.addEventListener("touchend", () => this.onTouchEnd(), { passive: false });
    }

    // ---------- Desktop ----------
    private onMouseMove(e: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.updateDir(x, y);
    }

    private onMouseDown(e: MouseEvent) {
        if (e.button === 0) this.mouseDown = true;
    }

    private onMouseUp(e: MouseEvent) {
        if (e.button === 0) this.mouseDown = false;
    }

    // ---------- Mobile ----------
    private onTouchStart(e: TouchEvent) {
        e.preventDefault();
        if (e.touches.length > 0) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.touches[0].clientX - rect.left;
            const y = e.touches[0].clientY - rect.top;
            this.updateDir(x, y);

            const now = Date.now();
            if (now - this.lastTapTime < this.doubleTapThreshold) {
                // double tap → boost
                this.mouseDown = true;
            }
            this.lastTapTime = now;
        }
    }

    private onTouchMove(e: TouchEvent) {
        e.preventDefault();
        if (e.touches.length > 0) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.touches[0].clientX - rect.left;
            const y = e.touches[0].clientY - rect.top;
            this.updateDir(x, y);
        }
    }

    private onTouchEnd() {
        this.mouseDown = false;
    }

    // ---------- Shared ----------
    private updateDir(x: number, y: number) {
        const canvasCenter = { x: this.canvas.width / 2, y: this.canvas.height / 2 };

        const dx = x - canvasCenter.x;
        const dy = y - canvasCenter.y;
        const len = Math.sqrt(dx * dx + dy * dy);

        if (len > 0) {
            this.dir.set(dx / len, dy / len);
        } else {
            this.dir.set(0, 0);
        }
    }
}

