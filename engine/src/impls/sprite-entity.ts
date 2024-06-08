import { Entity } from "../entity.js";
import { Rectangle } from "../utils/rectangle.js";
import { SpritePainter } from "./sprite-painter.js";

export abstract class SpriteEntity extends Entity {
  imageIndex: number = 0;
  zIndex: number = 0;
  flipHorizontal: boolean = false;
  flipVertical: boolean = false;
  scaleX: number = 1;
  scaleY: number = 1;
  bounds?: Rectangle;
  visible: boolean = true;
  alpha: number = 1;
  constructor(public readonly painter: SpritePainter, protected x: number = 0, protected y: number = 0) {
    super(painter);
    this.painter.setEid(this.getId());
  }

  getPos(): { x: number, y: number } {
    return { x: this.x, y: this.y };
  }

  collision(other: SpriteEntity): boolean {
    const selfBounds = this.bounds || this.painter.rectangle();
    const otherBounds = other.bounds || other.painter.rectangle();;

    return selfBounds.intersects(otherBounds);
  }

  spriteTransform(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
    ctx.transform(this.flipHorizontal ? -this.scaleX : this.scaleX, 0, 0, this.flipVertical ? -this.scaleY : this.scaleY, this.flipHorizontal ? this.scaleX : 0, this.flipVertical ? this.scaleY : 0);
    return { undo: () => ctx.transform(this.flipHorizontal ? -1 / this.scaleX : 1 / this.scaleX, 0, 0, this.flipVertical ? -1 / this.scaleY : 1 / this.scaleY, this.flipHorizontal ? 1 /this.scaleX : 0, this.flipVertical ? 1 /this.scaleY : 0)};
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