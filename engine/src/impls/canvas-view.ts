import { Entity } from "../entity";
import { Painter } from "../painter";
import { View } from "../view";

export class Canvas2DView implements View {
  private activated: boolean = false;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private text: HTMLParagraphElement;
  private div: HTMLDivElement;
  public readonly scale: number;
  public readonly dpi: number;
  private bgColor: string;

  constructor(width: number, height: number, options: { scale?: number, bgColor: string }) {
    this.scale = options.scale ?? 1;
    this.dpi = 96 * window.window.devicePixelRatio;
    this.bgColor = options.bgColor ?? '#00FFFFFF';

    this.canvas = document.createElement('canvas');
    this.canvas.width = width * this.scale;
    this.canvas.height = height * this.scale;
    this.canvas.style.width = `${this.canvas.width * 96 / this.dpi}px`;
    this.ctx = this.canvas.getContext('2d') || {
      canvas: HTMLCanvasElement,
      getContextAttributes(): CanvasRenderingContext2DSettings {
        return {
        } as CanvasRenderingContext2DSettings;
      }
    } as unknown as CanvasRenderingContext2D;
    this.ctx.imageSmoothingEnabled = false;
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
    this.ctx.clearRect(0, 0, this.canvas.width * this.scale, this.canvas.height * this.scale);
    this.ctx.fillStyle = this.bgColor;
    this.ctx.fillRect(0, 0, this.canvas.width * this.scale, this.canvas.height * this.scale);
    this.ctx.scale(this.scale, this.scale);
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      entity.painter.paint(this.ctx);
    }
    this.ctx.resetTransform();

    return Promise.resolve();
  }

  viewElement(): HTMLElement {
    return this.div;
  }

  activate(): void {
    if (!this.activated) {
      document.body.appendChild(this.viewElement());
    }
    this.activated = true;
  }

  deactivate(): void {
    if (this.activated) {
      document.body.removeChild(this.viewElement());
    }
    this.activated = false;
  }
}

export class Painter2D implements Painter {
  constructor(private callback: (args: CanvasRenderingContext2D) => void) {

  }

  paint(args: CanvasRenderingContext2D): void {
    this.callback(args);
  };
}