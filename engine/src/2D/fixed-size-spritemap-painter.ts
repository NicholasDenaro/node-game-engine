import { Rectangle } from '../utils/rectangle.js';
import { PainterContext } from './canvas2D-view.js';
import { SpriteEntity } from './sprite-entity.js';
import { SpritePainter } from './sprite-painter.js';
import { Sprite } from './sprite.js';

export class FixedSizeSpritemapPainter extends SpritePainter {

  private xIndex: number = 0;
  private yIndex: number = 0;
  private spriteWidth: number = 1;
  private spriteHeight: number = 1;

  constructor(private mySprite: Sprite, private entity: () => SpriteEntity, private myOptions?: { spriteWidth: number, spriteHeight: number, spriteOffsetX?: number, spriteOffsetY?: number }) {
    super(mySprite);
    this.myOptions = {...this.mySprite?.getOptions(), ...this.myOptions};
    this.myOptions.spriteOffsetX = this.myOptions.spriteOffsetX || 0;
    this.myOptions.spriteOffsetY = this.myOptions.spriteOffsetY || 0;
  }

  setImage(x: number, y: number, width: number, height: number) {
    this.xIndex = x;
    this.yIndex = y;
    this.spriteWidth = width * this.myOptions.spriteWidth;
    this.spriteHeight = height * this.myOptions.spriteHeight;
  }

  paintAt(ctx: PainterContext, x: number, y: number): void {

    const col = this.xIndex;
    const row = this.yIndex;
    const sx = col * this.myOptions.spriteWidth;
    const sy = row * this.myOptions.spriteHeight;
    if (this.mySprite.getImage()) {
      // ctx.fillStyle = '#FF00FF';
      // ctx.fillRect(this.rectangle().x, this.rectangle().y, this.rectangle().width, this.rectangle().height);
      ctx.transform(
        this.spriteWidth,
        0,
        0,
        this.spriteHeight,
        x - this.myOptions.spriteOffsetX,
        y - this.myOptions.spriteOffsetY);
      let tx = this.entity().spriteTransform(ctx);
      ctx.globalAlpha = this.entity().alpha;
      ctx.drawImage(
        this.mySprite.getImage(),
        sx,
        sy,
        this.spriteWidth,
        this.spriteHeight,
        0,
        0,
        1,
        1);
      ctx.globalAlpha = 1;
      tx.undo();
      ctx.transform(
        1 / this.spriteWidth,
        0,
        0,
        1 / this.spriteHeight,
        -(x - this.myOptions.spriteOffsetX) / this.spriteWidth,
        -(y - this.myOptions.spriteOffsetY) / this.spriteHeight);
    }
  }

  rectangle(): Rectangle {
    const baseRect = super.rectangle();
    baseRect.width = this.spriteWidth;
    baseRect.height = this.spriteHeight;
    return baseRect;
  }
}