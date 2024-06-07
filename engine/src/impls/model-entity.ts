import { Entity } from "../entity.js";
import { ModelPainter } from "./model-painter.js";

export abstract class ModelEntity extends Entity {
  imageIndex: number = 0;
  flipHorizontal: boolean = false;
  flipVertical: boolean = false;
  protected rotation: { roll: number, pitch: number, yaw: number } = {roll: 0, pitch: 0, yaw: 0};
  protected scale: { x: number, y: number, z: number } = {x: 1, y: 1, z: 1};
  constructor(public readonly painter: ModelPainter, protected x: number = 0, protected y: number = 0, protected z: number = 0) {
    super(painter);
    this.painter.setEid(this.getId());
  }

  getPos(): { x: number, y: number } {
    return { x: this.x, y: this.y };
  }

  getPos3D(): { x: number, y: number, z: number } {
    return { x: this.x, y: this.y, z: this.z };
  }

  getRot3D(): { roll: number, pitch: number, yaw: number } {
    return { roll: this.rotation.roll, pitch: this.rotation.pitch, yaw: this.rotation.yaw };
  }

  getScale(): { x: number, y: number, z: number } {
    return this.scale;
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