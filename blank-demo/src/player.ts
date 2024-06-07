import { Scene, Sound, Sprite, SpriteEntity, SpritePainter, ControllerState, Engine } from "game-engine";

export class Player extends SpriteEntity {
  constructor() {
    super(new SpritePainter(Sprite.Sprites['buddy']), 0, 0);
  }

  tick(engine: Engine, scene: Scene): Promise<void> | void {
    if (engine.isControl('button1', ControllerState.Press)) {
      Sound.Sounds['start']?.play();
    }

    if (engine.isControl('right', ControllerState.Down)) {
      this.x++;
    }
  }
}