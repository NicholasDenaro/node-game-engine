import { Entity } from "../entity.js";
import { ModelPainter } from "./model-painter.js";

export abstract class ModelEntity extends Entity {
  imageIndex: number = 0;
  flipHorizontal: boolean = false;
  flipVertical: boolean = false;
  constructor(public readonly painter: ModelPainter, protected x: number = 0, protected y: number = 0) {
    super(painter);
    this.painter.setEid(this.getId());
  }

  getPos(): { x: number, y: number } {
    return { x: this.x, y: this.y };
  }

  collision(other: ModelEntity): boolean {
    return this.painter.rectangle().intersects(other.painter.rectangle());
  }

  spriteTransform(ctx: CanvasRenderingContext2D) {
    ctx.transform(this.flipHorizontal ? -1 : 1, 0, 0, this.flipVertical ? -1 : 1, this.flipHorizontal ? 1 : 0, this.flipVertical ? 1 : 0);
    return { undo: () => ctx.transform(this.flipHorizontal ? -1 : 1, 0, 0, this.flipVertical ? -1 : 1, this.flipHorizontal ? 1 : 0, this.flipVertical ? 1 : 0) };
  }

  /**
   * Calculate the direction in radians
   * @param other 
   * @returns Direction in radians
   */
  direction(other: ModelEntity): number {
    return this.painter.rectangle().direction(other.painter.rectangle());
  }
}