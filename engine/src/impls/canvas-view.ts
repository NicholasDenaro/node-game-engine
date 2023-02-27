import { Entity } from "../entity";
import { Painter } from "../painter";
import { View } from "../view";

export class Canvas2DView implements View {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private text: HTMLParagraphElement;
    private div: HTMLDivElement;

    constructor(width: number, height: number, dpi: number) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = `${this.canvas.width * 96 / dpi}px`;
        this.ctx = this.canvas.getContext('2d') || {
            canvas: HTMLCanvasElement,
            getContextAttributes(): CanvasRenderingContext2DSettings {
                return {
                } as CanvasRenderingContext2DSettings;
            }
        } as unknown as CanvasRenderingContext2D;
        this.text = document.createElement('p');
        this.text.innerText = '';
        this.text.style.display = 'none';
        this.div = document.createElement('div');
        this.div.appendChild(this.text);
        this.div.appendChild(this.canvas);
    }

    debugInfo(info: any): void {
        this.text.innerText = JSON.stringify(info);
    }

    async draw(entities: Array<Entity>): Promise<void> {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            entity.painter.paint(this.ctx);
        }

        return Promise.resolve();
    }



    viewElement(): HTMLElement {
        return this.div;
    }
}

export class Painter2D implements Painter {
    constructor(private callback: (args: CanvasRenderingContext2D) => void) {

    }

    paint(args: CanvasRenderingContext2D): void {
        this.callback(args);
    };
}