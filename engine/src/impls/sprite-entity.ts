import { Entity } from "../entity.js";
import { SpritePainter } from "./sprite-painter.js";

export abstract class SpriteEntity extends Entity {
  imageIndex: number = 0;
  zIndex: number = 0;
  flipHorizontal: boolean = false;
  flipVertical: boolean = false;
  scaleX: number = 1;
  scaleY: number = 1;
  constructor(public readonly painter: SpritePainter, protected x: number = 0, protected y: number = 0) {
    super(painter);
    this.painter.setEid(this.getId());
  }

  getPos(): { x: number, y: number } {
    return { x: this.x, y: this.y };
  }

  collision(other: SpriteEntity): boolean {
    return this.painter.rectangle().intersects(other.painter.rectangle());
  }

  spriteTransform(ctx: CanvasRenderingContext2D) {
    ctx.transform(this.flipHorizontal ? -this.scaleX : this.scaleX, 0, 0, this.flipVertical ? -this.scaleY : this.scaleY, this.flipHorizontal ? this.scaleX : 0, this.flipVertical ? this.scaleY : 0);
    return { undo: () => ctx.transform(this.flipHorizontal ? -this.scaleX : this.scaleX, 0, 0, this.flipVertical ? -this.scaleY : this.scaleY, this.flipHorizontal ? this.scaleX : 0, this.flipVertical ? this.scaleY : 0)};
  }

  /**
   * Calculate the direction in radians
   * @param other 
   * @returns Direction in radians
   */
  direction(other: SpriteEntity): number {
    return this.painter.rectangle().direction(other.painter.rectangle());
  }
}