import { Engine } from "../engine.js";

export class FixedTickEngine extends Engine {

  private frameTime: number;
  public playInBackground: boolean = false;

  constructor(private ticksPerSecond: number, logTicks: boolean = false) {
    super();
    this._FPS = ticksPerSecond;
    this._TPS = ticksPerSecond;
    this.frameTime = 1000 / this.ticksPerSecond;
    console.log(`frameTime=${this.frameTime}`);
    if (logTicks) {
      setInterval(() => {
        console.log(`ticks: ${this.TPS()}`);
        const keys = Object.keys(this.scenes);
        for (let i = 0; i < keys.length; i++) {
          this.scenes[keys[i]].debugInfo(this.TPS());
        }
      }, 1000);
    }
  }

  _start():void {
    this.previousTime = performance.now();
    setTimeout(() => this.frames(), 1);
  }

  private time: number;
  private previousTime = 0;
  private async frames(): Promise<void> {
    if (this.isRunning) {
      let left = this.frameTime - (performance.now() - this.previousTime);
      while (left < 1) {
        if (this.isRunning) {
          await this.loop();
        }
        this.previousTime += this.frameTime;
        left += this.frameTime;
      }

      setTimeout(() => this.frames(), left ?? 1);
    }
  }

  private async loop(): Promise<void> {
    await this.tick();

    await new Promise<void>((resolve, reject) => {
      if (typeof window !== 'undefined') {
        if (this.playInBackground && document.hidden) {
          resolve();
          return;
        }
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
  }

  _stop(): void {
  }
}