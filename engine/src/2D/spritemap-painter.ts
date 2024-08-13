import { Rectangle } from '../utils/rectangle.js';
import { PainterContext } from './canvas2D-view.js';
import { SpriteEntity } from './sprite-entity.js';
import { SpritePainter } from './sprite-painter.js';
import { Sprite } from './sprite.js';

export class FixedSizeSpritemapPainter extends SpritePainter {
  private imageIndex: number = 0;
  constructor(private mySprite: Sprite, private entity: () => SpriteEntity, private images: {x: number, y: number, width: number, height: number, offsetX: number, offsetY: number}[]) {
    super(mySprite);
  }

  setImage(index: number) {
    this.imageIndex = index;
  }

  paintAt(ctx: PainterContext, x: number, y: number): void {
    const sx = this.images[this.imageIndex].x;
    const sy = this.images[this.imageIndex].y;
    const width = this.images[this.imageIndex].width;
    const height = this.images[this.imageIndex].height;
    const offsetX = this.images[this.imageIndex].offsetX;
    const offsetY = this.images[this.imageIndex].offsetY;
    if (this.mySprite.getImage()) {
      ctx.transform(
        width,
        0,
        0,
        height,
        x - offsetX,
        y - offsetY);
      let tx = this.entity().spriteTransform(ctx);
      ctx.globalAlpha = this.entity().alpha;
      ctx.drawImage(
        this.mySprite.getImage(),
        sx,
        sy,
        width,
        height,
        0,
        0,
        1,
        1);
      ctx.globalAlpha = 1;
      tx.undo();
      ctx.transform(
        1 / width,
        0,
        0,
        1 / height,
        -(x - offsetX) / width,
        -(y - offsetY) / height);
    }
  }

  rectangle(): Rectangle {
    const baseRect = super.rectangle();
    baseRect.width = this.images[this.imageIndex].width;
    baseRect.height = this.images[this.imageIndex].height;
    return baseRect;
  }
}