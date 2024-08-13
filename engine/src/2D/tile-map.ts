import { Engine } from '../engine.js';
import { Scene } from '../scene.js';
import { Canvas2DView, PainterContext } from './canvas2D-view.js';
import { SpriteEntity } from './sprite-entity.js';
import { SpritePainter } from './sprite-painter.js';
import { Sprite } from './sprite.js';

export class TileMap extends SpriteEntity {

  public readonly width;
  public readonly height;

  private view: Canvas2DView;
  private baseCanvas: OffscreenCanvas;
  private image: ImageBitmap;

  constructor(private sprites: { sprite: Sprite, firstgid: number, animated: boolean, tilecount: number}[], private tiles: number[], zIndex: number, private columns: number, private tileWidth: number, private tileHeight: number) {
    super(new SpritePainter((ctx) => this.draw(ctx), {spriteWidth: tileWidth, spriteHeight: tileHeight}));
    this.zIndex = zIndex;
    //console.log(tiles);
    this.width = columns * tileWidth;
    this.height = (tiles.length / columns) * tileHeight;

    this.baseCanvas = new OffscreenCanvas(this.width, this.height);
    this.fillImage();
  }

  tick(engine: Engine, scene: Scene): void | Promise<void> {
    this.view = scene.getView() as Canvas2DView;
  }

  fillImage() {
    const dcol = this.columns;

    const ctx = this.baseCanvas.getContext('2d');

    for (let y = 0; y < this.height / this.tileHeight; y++) {
      for (let x = 0; x < this.width / this.tileWidth; x++) {
        const i = x + y * this.columns;
        const dx = (i % dcol) * this.tileWidth;
        const dy = Math.floor(i / dcol) * this.tileHeight;

        const tile = (this.tiles[i] - 1);
        if (tile === -1) {
          continue;
        }
        let tileIndex = tile & (0x0FFFFFFF);

        const spriteIndex = this.sprites.findIndex(spriteInfo => tileIndex >= spriteInfo.firstgid && tileIndex < spriteInfo.firstgid + spriteInfo.tilecount);


        if (this.sprites[spriteIndex].animated) {
          continue;
        }

        const sprite = this.sprites[spriteIndex].sprite;

        tileIndex = (this.tiles[i] - this.sprites[spriteIndex].firstgid) & (0x0FFFFFFF);

        const scol = sprite.getImage().width / this.tileWidth;
        const sx = (tileIndex % scol) * this.tileWidth;
        const sy = Math.floor(tileIndex / scol) * this.tileHeight;

        const flipH = (tile & 0x80000000) == 0 ? 1 : -1;
        const flipV = (tile & 0x40000000) == 0 ? 1 : -1;
        const flipD = (tile & 0x20000000) != 0;

        //console.log(`c: ${col} r: ${col} sx: ${sx} sy: ${sy}`);
        if (flipH || flipV || flipD) {
          ctx.save();
          if (flipD) {
            ctx.transform(0, 1 * this.tileHeight * flipV, 1 * this.tileWidth * flipH, 0, dx + (flipH < 0 ? 16 : 0), dy + (flipV < 0 ? 16 : 0));
          } else {
            ctx.transform(1 * this.tileWidth * flipH, 0, 0, 1 * this.tileHeight * flipV, dx + (flipH < 0 ? 16 : 0), dy + (flipV < 0 ? 16 : 0));
          }
        }
        // ctx.drawImage(sprite.getImage(), sx, sy, this.tileWidth, this.tileHeight, (dx + this.x) * (flipH ? -1 : 1) + (flipH ? -16 : 0), (dy + this.y) * (flipV ? -1 : 1) + (flipV ? -16 : 0), this.tileWidth, this.tileHeight);
        ctx.drawImage(sprite.getImage(), sx, sy, this.tileWidth, this.tileHeight, 0, 0, 1, 1);
        if (flipH || flipV || flipD) {
          ctx.restore();
        }
      }
    }

    this.image = this.baseCanvas.transferToImageBitmap();
  }

  draw(ctx: PainterContext) {
    if (!this.visible || !this.view || !this.image) {
      console.log('tile map not drawn');
      return;
    }

    const rows = this.height / this.tileHeight;
    const viewRect = { ...this.view.getOffset(), right: 0, bottom: 0 };
    
    viewRect.right = viewRect.x + this.view.rectangle().width / this.view.scale * window.devicePixelRatio;
    viewRect.bottom = viewRect.y + this.view.rectangle().height / this.view.scale * window.devicePixelRatio;


    viewRect.x = Math.max(0, Math.floor(viewRect.x));
    viewRect.y = Math.max(0, Math.floor(viewRect.y));
    viewRect.right = Math.min(Math.floor(viewRect.right) + 1, this.columns * this.tileWidth);
    viewRect.bottom = Math.min(Math.floor(viewRect.bottom) + 1, rows * this.tileHeight);

    const presetAlpha = ctx.globalAlpha;
    ctx.globalAlpha = this.alpha;
    ctx.drawImage(this.image, viewRect.x, viewRect.y, (viewRect.right - viewRect.x), (viewRect.bottom - viewRect.y), viewRect.x, viewRect.y, (viewRect.right - viewRect.x), (viewRect.bottom - viewRect.y));
    ctx.globalAlpha = presetAlpha;
  }
}