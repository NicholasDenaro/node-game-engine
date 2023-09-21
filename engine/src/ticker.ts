import { Scene } from "./scene.js";

export interface ticker {
    tick(scene: Scene): Promise<void> | void;
}