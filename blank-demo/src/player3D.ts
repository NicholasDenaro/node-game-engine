import { Scene, Sound, ControllerState, ModelEntity, ModelPainter, Model } from "game-engine";
import { FPS } from "./game.js";

export class Player3D extends ModelEntity {
  constructor(model: Model) {
    super(new ModelPainter(model, {spriteWidth: 64, spriteHeight: 96}), 0, 0, -6);
  }

  tick(scene: Scene): Promise<void> | void {
    if (scene.isControl('button1', ControllerState.Press)) {
      Sound.Sounds['start']?.play();
    }

    if (scene.isControl('right', ControllerState.Down)) {
      this.x += 0.1 * Math.sin(this.yaw - Math.PI / 2);
      this.z += 0.1 * Math.cos(this.yaw - Math.PI / 2);
    }

    if (scene.isControl('left', ControllerState.Down)) {
      this.x += 0.1 * Math.sin(this.yaw + Math.PI / 2);
      this.z += 0.1 * Math.cos(this.yaw + Math.PI / 2);
    }

    if (scene.isControl('up', ControllerState.Down)) {
      this.z += 0.1 * Math.cos(this.yaw);
      this.x += 0.1 * Math.sin(this.yaw);
    }

    if (scene.isControl('down', ControllerState.Down)) {
      this.z += 0.1 * -Math.cos(this.yaw);
      this.x += 0.1 * -Math.sin(this.yaw);
    }

    if (scene.isControl('action', ControllerState.Down)) {
      this.y += 0.1;
    }

    if (scene.isControl('run', ControllerState.Down)) {
      this.y -= 0.1;
    }

    if (scene.isControl('interact1', ControllerState.Down)) {
      this.yaw += Math.PI * 2 / FPS;
    }

    if (scene.isControl('interact2', ControllerState.Down)) {
      this.yaw -= Math.PI * 2 / FPS;
    }
  }
}