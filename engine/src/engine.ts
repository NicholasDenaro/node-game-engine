import { Scene } from "./scene";

export abstract class Engine {

    protected isRunning: boolean = false;

    protected sceneBuffer = new Array<{ key: string; scene: Scene; }>;

    protected scenes: { [key: string]: Scene; } = {};

    addScene(key: string, scene: Scene): void {
        if (!this.isRunning) {
            this.scenes[key] = scene;
        }
        else {
            this.sceneBuffer.push({key, scene});
        }
    }

    abstract start(): Promise<void> | void;
    abstract stop(): Promise<void> | void;

    async draw(): Promise<void> {
        const keys = Object.keys(this.scenes);
        for (let i = 0 ; i < keys.length; i++) {
            await this.scenes[keys[i]].draw();
        }
    }

    async tick(): Promise<void> {
        const keys = Object.keys(this.scenes);
        for (let i = 0 ; i < keys.length; i++) {
            await this.scenes[keys[i]].tick();
        }
    }
}