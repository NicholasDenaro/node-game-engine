import { Entity, EntityID } from "./entity";
import { Scene } from "./scene";

export abstract class Engine {

  static readonly constructors: { [key: string]: (args: any) => Entity } = {};

  static readonly entities: { [key: EntityID]: Entity } = {};

  protected isRunning: boolean = false;

  protected sceneBuffer = new Array<{ key: string; scene: Scene; }>;

  protected scenes: { [key: string]: Scene; } = {};

  addScene(key: string, scene: Scene): void {
    if (!this.isRunning) {
      this.scenes[key] = scene;
    }
    else {
      this.sceneBuffer.push({ key, scene });
    }
  }

  sceneKey(scene: Scene): string {
    return Object.keys(this.scenes).filter(sceneKey => this.scenes[sceneKey] === scene)[0];
  }

  activateScene(scene: string) {
    this.scenes[scene]?.activate();
  }

  deactivateScene(scene: string) {
    this.scenes[scene]?.deactivate();
  }

  deactivateAllScenes() {
    for (let scene in this.scenes) {
      this.scenes[scene]?.deactivate();
    }
  }

  switchToScene(scene: string) {
    this.deactivateAllScenes();
    this.activateScene(scene);
  }

  abstract start(): Promise<void> | void;
  abstract stop(): Promise<void> | void;

  async draw(): Promise<void> {
    const keys = Object.keys(this.scenes);
    for (let i = 0; i < keys.length; i++) {
      await this.scenes[keys[i]].draw();
    }
  }

  async tick(): Promise<void> {
    const scenes = this.sceneBuffer.splice(0, this.sceneBuffer.length);
    scenes.forEach(scene => {
      this.scenes[scene.key] = scene.scene;
    })

    
    const keys = Object.entries(this.scenes).filter(val => val[1].isActivated()).map(val => val[0]);
    for (let i = 0; i < keys.length; i++) {
      await this.scenes[keys[i]].tick();
    }
  }
}