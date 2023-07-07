import { Scene, Sprite, SpriteEntity, SpritePainter } from "game-engine";

export class Player extends SpriteEntity {
  constructor() {
    super(new SpritePainter(Sprite.Sprites['buddy']), 0, 0);
  }

  tick(scene: Scene): Promise<void> | void {
  }
}