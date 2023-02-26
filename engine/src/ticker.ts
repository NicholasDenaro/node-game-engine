import { Scene } from "./scene";

export interface ticker {
    tick(scene: Scene): Promise<void> | void;
}