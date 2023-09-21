import { Entity, EntityID } from "./entity.js";
import { Scene } from "./scene.js";

export abstract class Engine {

  static readonly constructors: { [key: string]: (args: any) => Entity } = {};

  static readonly entities: { [key: EntityID]: Entity } = {};
  protected readonly actions: { [key: string]: () => void } = {};

  protected isRunning: boolean = false;
  protected isTick: boolean = false;

  protected sceneBuffer = new Array<{ key: string; scene: Scene; }>;
  protected sceneActivateBuffer = new Array<{ key: string; activate: boolean; }>;

  protected scenes: { [key: string]: Scene; } = {};

  addAction(key: string, action: () => void) {
    this.actions[key] = action;
  }

  removeAction(key: string) {
    delete this.actions[key];
  }

  addEntity(sceneKey: string, entity: Entity) {
    this.scenes[sceneKey]?.addEntity(entity);
  }

  removeEntity(sceneKey: string, entity: Entity) {
    this.scenes[sceneKey]?.removeEntity(entity);
  }

  addScene(key: string, scene: Scene): void {
    if (this.isRunning && this.isTick) {
      this.sceneBuffer.push({ key, scene });
    }
    else {
      this.scenes[key] = scene;
    }
  }

  sceneKey(scene: Scene): string {
    return Object.keys(this.scenes).filter(sceneKey => this.scenes[sceneKey] === scene)[0];
  }

  activateScene(scene: string) {
    if (this.isRunning && this.isTick) {
      this.sceneActivateBuffer.push({ key: scene, activate: true });
    } else {
      this.scenes[scene]?.activate();
    }
  }

  deactivateScene(scene: string) {
    if (this.isRunning && this.isTick) {
      this.sceneActivateBuffer.push({key: scene, activate: false});
    }
    else {
      this.scenes[scene]?.deactivate();
    }
  }

  deactivateAllScenes() {
    for (let scene in this.scenes) {
      this.deactivateScene(scene);
    }
  }

  switchToScene(scene: string) {
    this.deactivateAllScenes();
    this.activateScene(scene);
  }

  getScene(sceneKey: string) {
    return this.scenes[sceneKey];
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

    this.sceneActivateBuffer.forEach(scene => {
      if (scene.activate) {
        this.activateScene(scene.key);
      } else {
        this.deactivateScene(scene.key);
      }
    })

    this.isTick = true;

    Object.values(this.actions).forEach(action => {
      action();
    })
    
    const keys = Object.entries(this.scenes).filter(val => val[1].isActivated()).map(val => val[0]);
    for (let i = 0; i < keys.length; i++) {
      await this.scenes[keys[i]].tick();
    }

    this.isTick = false;
  }
}