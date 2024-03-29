import { Engine } from "../engine.js";
import { Sprite } from "./sprite.js";
import { Rectangle } from "../utils/rectangle.js";
import { Painter3D } from "./canvas3D-view.js";
import { SpriteEntity } from "./sprite-entity.js";

export class ModelPainter extends Painter3D {

  private eid: number;
  private sprite: Sprite;
  private directDraw: (gfx: WebGL2RenderingContext, program: WebGLProgram, ctx: CanvasRenderingContext2D) => void;

  setEid(eid: number) {
    this.eid = eid;
  }

  constructor(img: Sprite | ((gfx: WebGL2RenderingContext, program: WebGLProgram, ctx: CanvasRenderingContext2D) => void), private options?: { spriteWidth: number, spriteHeight: number, spriteOffsetX?: number, spriteOffsetY?: number }) {
    super(null);
    if (img instanceof Sprite) {
      this.sprite = img;
      this.options = this.sprite?.getOptions() || this.options;
    } else {
      this.directDraw = img;
    }
    this.options.spriteOffsetX = this.options.spriteOffsetX || 0;
    this.options.spriteOffsetY = this.options.spriteOffsetY || 0;
  }

  override paint(gfx: WebGL2RenderingContext, program: WebGLProgram, ctx: CanvasRenderingContext2D): void {
    if (this.sprite) {
      const entity = Engine.entities[this.eid] as SpriteEntity;
      const col = entity.imageIndex % this.sprite.getGrid().columns;
      const row = Math.floor(entity.imageIndex / this.sprite.getGrid().columns);
      const sx = col * this.options.spriteWidth;
      const sy = row * this.options.spriteHeight;
      if (this.sprite.getImage()) {
        // ctx.fillStyle = '#FF00FF';
        // ctx.fillRect(this.rectangle().x, this.rectangle().y, this.rectangle().width, this.rectangle().height);
        ctx.transform(
          this.options.spriteWidth,
          0,
          0,
          this.options.spriteHeight,
          entity.getPos().x - this.options.spriteOffsetX,
          entity.getPos().y - this.options.spriteOffsetY);
        let tx = entity.spriteTransform(ctx);
        ctx.drawImage(
          this.sprite.getImage(),
          sx,
          sy,
          this.options.spriteWidth,
          this.options.spriteHeight,
          0,
          0,
          1,
          1);
        tx.undo();
        ctx.transform(
          1 / this.options.spriteWidth,
          0,
          0,
          1 / this.options.spriteHeight,
          -(entity.getPos().x - this.options.spriteOffsetX) / this.options.spriteWidth,
          -(entity.getPos().y - this.options.spriteOffsetY) / this.options.spriteHeight);
      }
    } else if (this.directDraw) {
      this.directDraw(gfx, program, ctx);
    }
  }

  rectangle(): Rectangle {
    const entity = Engine.entities[this.eid] as SpriteEntity;
    return new Rectangle(entity.getPos().x - this.options.spriteOffsetX, entity.getPos().y - this.options.spriteOffsetY, this.options.spriteWidth, this.options.spriteHeight);
  }
}