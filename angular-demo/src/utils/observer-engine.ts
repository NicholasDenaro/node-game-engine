import { Engine } from "game-engine";

export class ObserverEngine extends Engine {

    start(): Promise<void> | void {
        this.isRunning = true;
    }
    stop(): Promise<void> | void {
        this.isRunning = false;
    }

    async doTick(): Promise<void> {
        console.log('tick');
        await this.tick();
        console.log('draw');
        await this.draw();
    }
}