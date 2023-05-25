import { Engine } from "../engine";
import { Rectangle } from "../utils/rectangle";
import { Painter2D } from "./canvas-view";
import { SpriteEntity } from "./sprite-entity";

export class SpritePainter extends Painter2D {

  private img: CanvasImageSource;
  private eid: number;
  private columns: number;
  private rows: number

  setEid(eid: number) {
    this.eid = eid;
  }

  constructor(imgFile: string, private options: {spriteWidth: number, spriteHeight: number, spriteOffsetX?: number, spriteOffsetY?: number}) {
    super(null);
    this.img = new Image();
    this.img.src = imgFile;
    console.log(`Using image: ${imgFile}`);
    this.columns = this.img.naturalWidth / this.options.spriteWidth;
    this.rows = this.img.naturalHeight / this.options.spriteHeight;
    console.log(`c, r: ${this.columns}, ${this.rows}`);
  }

  override paint(ctx: CanvasRenderingContext2D): void {
    const entity = Engine.entities[this.eid] as SpriteEntity;
    const col = entity.imageIndex % this.columns;
    const row = Math.floor(entity.imageIndex / this.columns);
    const sx = col * this.options.spriteWidth;
    const sy = row * this.options.spriteHeight;
    ctx.drawImage(this.img, sx, sy, this.options.spriteWidth, this.options.spriteHeight, entity.getPos().x, entity.getPos().y, this.options.spriteWidth, this.options.spriteHeight);
  }

  rectangle(): Rectangle {
    const entity = Engine.entities[this.eid] as SpriteEntity;
    return new Rectangle(entity.getPos().x, entity.getPos().y, this.options.spriteWidth, this.options.spriteHeight);
  }
}