import { Engine } from "../engine.js";

export class FixedTickEngine extends Engine {

  private tickCount = 0;
  private frameTime: number;

  constructor(private ticksPerSecond: number, logTicks: boolean = false) {
    super();
    this.frameTime = 1000 / this.ticksPerSecond;
    console.log(`frameTime=${this.frameTime}`);
    if (logTicks) {
      setInterval(() => {
        console.log(`ticks: ${this.tickCount}`);
        const keys = Object.keys(this.scenes);
        for (let i = 0; i < keys.length; i++) {
          this.scenes[keys[i]].debugInfo(this.tickCount);
        }
        this.tickCount = 0;
      }, 1000);
    }
  }

  start(): Promise<void> {
    this.isRunning = true;
    this.previousTime = performance.now(); // This disables fast-forward // or so I thought, but problems arise when tab is in background and then re-entered
    setTimeout(() => this.frames(), 1);

    return new Promise(() => {});
  }

  private previousTime = 0;
  private async frames(): Promise<void> {
    if (this.isRunning) {
      let left = this.frameTime - (performance.now() - this.previousTime);
      if (left <= 0) {
        if (this.isRunning) {
          await this.loop();
        }
        this.previousTime += this.frameTime;
      }

      setTimeout(() => this.frames(), 1);
    }
  }

  private async loop(): Promise<void> {
    await this.tick();

    await new Promise<void>((resolve, reject) => {
      if (typeof window !== 'undefined') {
        window.requestAnimationFrame(async () => {
          await this.draw();
          resolve();
        });
      } else {
        resolve();
      }
    });

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