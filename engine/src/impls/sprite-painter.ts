import { Engine } from "../engine";
import { Sprite } from "../sprite";
import { Rectangle } from "../utils/rectangle";
import { Painter2D } from "./canvas-view";
import { SpriteEntity } from "./sprite-entity";

export class SpritePainter extends Painter2D {

  private eid: number;

  setEid(eid: number) {
    this.eid = eid;
  }

  constructor(private sprite: Sprite, private options?: { spriteWidth: number, spriteHeight: number, spriteOffsetX?: number, spriteOffsetY?: number }) {
    super(null);
    this.options = this.sprite?.getOptions() || this.options;
    this.options.spriteOffsetX = this.options.spriteOffsetX || 0;
    this.options.spriteOffsetY = this.options.spriteOffsetY || 0;
  }

  override paint(ctx: CanvasRenderingContext2D): void {
    if (this.sprite) {
      const entity = Engine.entities[this.eid] as SpriteEntity;
      const col = entity.imageIndex % this.sprite.getGrid().columns;
      const row = Math.floor(entity.imageIndex / this.sprite.getGrid().columns);
      const sx = col * this.options.spriteWidth;
      const sy = row * this.options.spriteHeight;
      if (this.sprite.getImage()) {
        ctx.drawImage(
          this.sprite.getImage(),
          sx,
          sy,
          this.options.spriteWidth,
          this.options.spriteHeight,
          entity.getPos().x - this.options.spriteOffsetX,
          entity.getPos().y - this.options.spriteOffsetY,
          this.options.spriteWidth,
          this.options.spriteHeight);
      }
    }
  }

  rectangle(): Rectangle {
    const entity = Engine.entities[this.eid] as SpriteEntity;
    return new Rectangle(entity.getPos().x - this.options.spriteOffsetX, entity.getPos().y - this.options.spriteOffsetY, this.options.spriteWidth, this.options.spriteHeight);
  }
}