import { Engine } from "../engine";

export class FixedTickEngine extends Engine {

    private tickCount = 0;
    private frameTime: number;

    constructor(private ticksPerSecond: number) {
        super();
        this.frameTime = 1000 / this.ticksPerSecond;
        console.log(`frameTime=${this.frameTime}`);
        setInterval(() => {
            console.log(`ticks: ${this.tickCount}`);
            const keys = Object.keys(this.scenes);
            for (let i = 0 ; i < keys.length; i++) {
                this.scenes[keys[i]].debugInfo(this.tickCount);
            }
            this.tickCount = 0;
        }, 1000);
    }

    start(): Promise<void> {
        this.isRunning = true;
        const promise = new Promise<void>((resolve, reject) => {
            window.requestAnimationFrame((time) => this.frames(time));
            resolve();
        });
        
        return promise;
    }

    private previousTime = 0;
    private async frames(time: number): Promise<void> {
        if (this.isRunning) {
            let left = this.frameTime - (time - this.previousTime);
            if (left <= 0) {
                if (this.isRunning) {
                    await this.loop();
                }
                this.previousTime += this.frameTime;
            }
            
            window.requestAnimationFrame(async (time) => await this.frames(time));
        }
    }

    private async loop(): Promise<void> {
        await this.tick();

        await this.draw();

        const scenesToAdd = this.sceneBuffer.splice(0, this.sceneBuffer.length);
        scenesToAdd.forEach(sceneInfo => {
            this.scenes[sceneInfo.key] = sceneInfo.scene;
        });

        this.tickCount++;
    }

    stop(): Promise<void> {
        this.isRunning = false;
        return Promise.resolve();
    }
}