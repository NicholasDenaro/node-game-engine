import { Controller, ControllerState } from "./controller.js";
import { Entity, EntityID } from "./entity.js";
import { Canvas2DView } from "./impls/canvas2D-view.js";
import { Canvas3DView } from "./impls/canvas3D-view.js";
import { Scene } from "./scene.js";
import { Stopwatch } from './utils/stopwatch.js';
import { View } from "./view.js";

export abstract class Engine {

  static readonly constructors: { [key: string]: (args: any) => Entity } = {};

  static readonly entities: { [key: EntityID]: Entity } = {};
  protected readonly actionsPre: { [key: string]: () => void } = {};
  protected readonly actionsPost: { [key: string]: () => void } = {};

  protected isRunning: boolean = false;
  protected isTick: boolean = false;

  private fpsStopwatch: Stopwatch = new Stopwatch();
  private frameCount: number = 0;
  protected _FPS: number = 1;
  public FPS(): number {
    return this._FPS;
  }

  private tpsStopwatch: Stopwatch = new Stopwatch();
  private tickCount: number = 0;
  protected _TPS: number = 1;
  public TPS(): number {
    return this._TPS;
  }

  protected sceneBuffer = new Array<{ key: string; scene: Scene; }>;
  protected sceneActivateBuffer = new Array<{ key: string; activate: boolean; }>;

  protected scenes: { [key: string]: Scene; } = {};

  private controllers = new Array<Controller>();

  addActionPre(key: string, action: () => void): void {
    this.actionsPre[key] = action;
  }

  removeActionPre(key: string): void {
    delete this.actionsPre[key];
  }

  addActionPost(key: string, action: () => void): void {
    this.actionsPost[key] = action;
  }

  removeActionPost(key: string): void {
    delete this.actionsPost[key];
  }

  addEntity(sceneKey: string, entity: Entity): void {
    this.scenes[sceneKey]?.addEntity(entity);
  }

  removeEntity(sceneKey: string, entity: Entity): void {
    this.scenes[sceneKey]?.removeEntity(entity);
  }

  addController(controller: Controller) {
    this.controllers.push(controller);
  }

  isControl(binding: string, state: ControllerState) {
    for (let i = 0; i < this.controllers.length; i++) {
      if (this.controllers[i].isControl(binding, state)) {
        return true;
      }
    }

    return false;
  }


  controlDetails(binding: string, view: View): any | undefined {
    for (let i = 0; i < this.controllers.length; i++) {
      if (this.controllers[i].getDetails(binding)) {
        const details = this.controllers[i].getDetails(binding);
        if (view instanceof Canvas2DView) {
          if (details.x) {
            details.x = ((details.x - view.rectangle().x) / view.scale) * (view.dpi / 96);
          }
          if (details.y) {
            details.y = ((details.y - view.rectangle().y) / view.scale) * (view.dpi / 96);
          }
          if (details.dx) {
            details.dx = (details.dx / view.scale) * (view.dpi / 96);
          }
          if (details.dy) {
            details.dy = (details.dy / view.scale) * (view.dpi / 96);
          }
        }
        if (view instanceof Canvas3DView) {
          if (details.x) {
            details.x = ((details.x - view.rectangle().x) / view.scale) * (view.dpi / 96);
          }
          if (details.y) {
            details.y = ((details.y - view.rectangle().y) / view.scale) * (view.dpi / 96);
          }
        }
        return details;
      }
    }

    return undefined;
  }

  addScene(scene: Scene): void {
    if (this.isRunning && this.isTick) {
      this.sceneBuffer.push({ key: scene.key, scene });
    }
    else {
      this.scenes[scene.key] = scene;
    }
  }

  activateScene(scene: string): void {
    if (this.isRunning && this.isTick) {
      this.sceneActivateBuffer.push({ key: scene, activate: true });
    } else {
      if (this.sceneActivateBuffer.length > 0) {
        this.flushSceneActivateBuffer();
      }
      this.scenes[scene]?.activate();
    }
  }

  deactivateScene(scene: string): void {
    if (this.isRunning && this.isTick) {
      this.sceneActivateBuffer.push({key: scene, activate: false});
    }
    else {
      if (this.sceneActivateBuffer.length > 0) {
        this.flushSceneActivateBuffer();
      }
      this.scenes[scene]?.deactivate();
    }
  }

  deactivateAllScenes(): void {
    for (let scene in this.scenes) {
      this.deactivateScene(scene);
    }
  }

  switchToScene(scene: string): void {
    if (!this.scenes[scene]) {
      console.warn(`Invalid scene key: ${scene}`);
    }
    this.deactivateAllScenes();
    this.activateScene(scene);
  }

  getScene(sceneKey: string): Scene {
    return this.scenes[sceneKey];
  }

  getActivatedScenes(): Scene[] {
    return Object.keys(this.scenes).filter(key => this.scenes[key].isActivated()).map(key => this.scenes[key]);
  }

  async start(): Promise<void> {
    this.isRunning = true;
    this.tpsStopwatch.start();
    this.fpsStopwatch.start();
    await this._start();
  }
  async stop(): Promise<void> {
    this.isRunning = false;
    this.tpsStopwatch.stop();
    this.fpsStopwatch.stop();
    await this._stop();
  }

  protected abstract _start(): Promise<void> | void;
  protected abstract _stop(): Promise<void> | void;

  async draw(): Promise<void> {
    const keys = Object.keys(this.scenes);
    for (let i = 0; i < keys.length; i++) {
      await this.scenes[keys[i]].draw();
    }

    this.frameCount++;
    if (this.fpsStopwatch.time() > 1000) {
      this._FPS = this.frameCount;
      this.fpsStopwatch.start();
      this.frameCount = 0;
    }
  }

  async tick(): Promise<void> {
    const scenes = this.sceneBuffer.splice(0, this.sceneBuffer.length);
    scenes.forEach(scene => {
      this.scenes[scene.key] = scene.scene;
    });

    this.flushSceneActivateBuffer();

    for (let i = 0; i < this.controllers.length; i++) {
      await this.controllers[i].tick();
    }

    this.isTick = true;

    for (let preAction of Object.values(this.actionsPre)) {
      await preAction();
    }
    
    const keys = Object.entries(this.scenes).filter(val => val[1].isActivated()).map(val => val[0]);
    for (let i = 0; i < keys.length; i++) {
      await this.scenes[keys[i]].tick(this);
    }

    for (let postAction of Object.values(this.actionsPost)) {
      await postAction();
    }

    this.isTick = false;

    this.tickCount++;
    if (this.tpsStopwatch.time() > 1000) {
      this._TPS = this.tickCount;
      this.tpsStopwatch.start();
      this.tickCount = 0;
    }
  }

  flushSceneActivateBuffer(): void {
    const bufferLength = this.sceneActivateBuffer.length;
    this.sceneActivateBuffer.splice(0, bufferLength).forEach(scene => {
      if (scene.activate) {
        this.activateScene(scene.key);
      } else {
        this.deactivateScene(scene.key);
      }
    });
  }

  static transferEntity(entity: Entity, sceneFrom: Scene, sceneTo: Scene): void {
    sceneFrom.removeEntity(entity);
    sceneTo.addEntity(entity);
  }
}