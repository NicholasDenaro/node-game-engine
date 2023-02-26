import { Scene } from "./scene";
import { ticker } from "./ticker";

export interface Engine {
    addScene(key: string, scene: Scene): void;
    start(): Promise<void>;
    stop(): Promise<void>;
    tick(): Promise<void>;
    draw(): Promise<void>;
}