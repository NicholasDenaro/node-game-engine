import { Engine, Entity, Scene, Sprite, SpriteEntity, SpritePainter, UIPainter } from "game-engine";

export class Button extends SpriteEntity {

  constructor() {
    super(new UIPainter(Sprite.Sprites['button']));
  }

  tick(engine: Engine, scene: Scene): void | Promise<void> {
  }
}