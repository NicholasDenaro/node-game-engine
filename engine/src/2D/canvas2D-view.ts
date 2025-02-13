import { Entity } from "../entity.js";
import { Painter } from "../painter.js";
import { Rectangle } from "../utils/rectangle.js";
import { View } from "../view.js";
import { SpriteEntity } from "./sprite-entity.js";

export class Canvas2DView implements View {
  private activated: boolean = false;
  protected canvas: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D;
  private text: HTMLParagraphElement;
  private div: HTMLDivElement;
  public readonly scale: number;
  public readonly dpi: number;
  private bgColor: string;
  private offsetX: number;
  private offsetY: number;
  private width: number;
  private height: number;

  constructor(width: number, height: number, options: { scale?: number, bgColor?: string }) {
    this.scale = options.scale ?? 1;
    this.dpi = 96 * window.window.devicePixelRatio;
    this.bgColor = options.bgColor;

    this.canvas = document.createElement('canvas');
    this.width = width;
    this.height = height;
    this.canvas.width = width * this.scale;
    this.canvas.height = height * this.scale;
    this.canvas.style.display = 'block';
    this.canvas.style.width = `${this.canvas.width * 96 / this.dpi}px`;
    this.ctx = this.canvas.getContext('2d');
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

  showDebugInfo() {
    this.text.style.display = 'block';
  }

  hideDebugInfo() {
    this.text.style.display = 'none';
  }

  rectangle() {
    const rect =  this.canvas.getClientRects();
    return new Rectangle(rect[0].x, rect[0].y, rect[0].width, rect[0].height);
  }

  preScaleSize(): {width: number, height: number} {
    return {width: this.width, height: this.height};
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.canvas.width = width * this.scale;
    this.canvas.height = height * this.scale;
    this.canvas.style.width = `${this.canvas.width * 96 / this.dpi}px`;
    this.ctx.imageSmoothingEnabled = false;
  }

  setOffset(x: number, y: number) {
    this.offsetX = x;
    this.offsetY = y;
  }

  getOffset(): {x: number, y: number} {
    return {x: this.offsetX || 0, y: this.offsetY || 0};
  }

  draw(entities: Array<Entity>): void {
    this.ctx.clearRect(0, 0, this.canvas.width * this.scale, this.canvas.height * this.scale);
    if (this.bgColor) {
      this.ctx.fillStyle = this.bgColor;
      this.ctx.fillRect(0, 0, this.canvas.width * this.scale, this.canvas.height * this.scale);
    }
    this.ctx.scale(this.scale, this.scale);
    this.ctx.translate(-this.offsetX, -this.offsetY);
    const sortedEntities = [...entities].sort(this.entitySortFunction);
    for (let i = 0; i < sortedEntities.length; i++) {
      const entity = sortedEntities[i];
      entity.painter.paint(this.ctx);
    }
    this.ctx.resetTransform();
  }

  entitySortFunction(a: Entity, b: Entity): number {
    const aZ = (a instanceof SpriteEntity) ? a.zIndex : 999;
    const bZ = (b instanceof SpriteEntity) ? b.zIndex : 999;
    return -(aZ - bZ);
  }

  viewElement(): HTMLElement {
    return this.div;
  }

  hasElement(element: Element | EventTarget): boolean {
    return this.canvas == element;
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
  constructor(private callback: (args: PainterContext) => void) {

  }

  paint(args: PainterContext): void {
    this.callback(args);
  }
}

export type PainterContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;