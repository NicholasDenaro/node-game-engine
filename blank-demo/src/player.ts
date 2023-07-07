import { Scene, Sound, Sprite, SpriteEntity, SpritePainter, ControllerState } from "game-engine";

export class Player extends SpriteEntity {
  constructor() {
    super(new SpritePainter(Sprite.Sprites['buddy']), 0, 0);
  }

  tick(scene: Scene): Promise<void> | void {
    if (scene.isControl('button1', ControllerState.Press)) {
      Sound.Sounds['start'].play();
    }
  }
}