import { PainterContext } from './canvas2D-view.js';
import { SpritePainter } from './sprite-painter.js';
import { Sprite } from './sprite.js';

export class LayeredSpritePainter extends SpritePainter {
  public painter: SpritePainter;
  constructor(private sprites: Sprite[]) {
    super((ctx) => this.draw(ctx), sprites[0].getOptions());
    this.painter = new SpritePainter(this.sprites[0]);
    this.painter.setEid(this.eid);
  }

  draw(ctx: PainterContext) {
    for (let i = 0; i < this.sprites.length; i++) {
      this.painter.setSprite(this.sprites[i]);
      this.painter.paint(ctx);
    }
  }
}