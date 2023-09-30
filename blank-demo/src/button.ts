import { Entity, Scene, Sprite, SpriteEntity, SpritePainter, UIPainter } from "game-engine";

export class Button extends SpriteEntity {

  constructor() {
    super(new UIPainter(Sprite.Sprites['button']));
  }

  tick(scene: Scene): void | Promise<void> {
  }
}