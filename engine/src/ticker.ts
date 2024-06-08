import { Engine } from "./engine.js";
import { Scene } from "./scene.js";

export interface ticker {
  tick(engine: Engine, scene: Scene): Promise<void> | void;
  pretick(engine: Engine, scene: Scene): Promise<void> | void;
  posttick(engine: Engine, scene: Scene): Promise<void> | void;
}