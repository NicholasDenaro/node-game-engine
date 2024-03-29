import { CanActivate } from "./can-activate.js";
import { Controller, ControllerState } from "./controller.js";
import { Engine } from "./engine.js";
import { Entity } from "./entity.js";
import { Canvas2DView } from "./impls/canvas2D-view.js";
import { Canvas3DView } from "./impls/canvas3D-view.js";
import { MouseController } from "./impls/mouse-controller.js";
import { View } from "./view.js";

export class Scene implements CanActivate {

  constructor(private engine: Engine, private view: View) {

  }

  getView(): View {
    return this.view;
  }

  private entities = new Array<Entity>();
  public entitiesSlice(filter: (entity: Entity) => boolean) {
    return this.entities.filter(filter).slice();
  }
  public entitiesByType<TType extends Entity>(constructor: new (...args: any[]) => TType): TType[] {
    return <TType[]>this.entitiesSlice(entity => entity instanceof constructor);
  }
  // private entityAddBuffer = new Array<Entity>();
  // private entityRemoveBuffer = new Array<Entity>();
  private entityActionBuffer = new Array<{add: boolean, entity: Entity}>();
  private controllers = new Array<Controller>();

  private isActive = false;

  isActivated(): boolean {
    return this.isActive;
  }

  activate() {
    this.isActive = true;
    this.view.activate();
  }

  deactivate() {
    this.isActive = false;
    this.view.deactivate();
  }

  addController(controller: Controller) {
    this.controllers.push(controller);
    if (controller instanceof MouseController) {
      controller.bindToView(this.view);
    }
  }

  isControl(binding: string, state: ControllerState) {
    for (let i = 0; i < this.controllers.length; i++) {
      if (this.controllers[i].isControl(binding, state)) {
        return true;
      }
    }

    return false;
  }

  controlDetails(binding: string): any | undefined {
    for (let i = 0; i < this.controllers.length; i++) {
      if (this.controllers[i].getDetails(binding)) {
        const details = this.controllers[i].getDetails(binding);
        if (this.view instanceof Canvas2DView) {
          if (details.x) {
            details.x = ((details.x - this.view.rectangle().x) / this.view.scale) * (this.view.dpi / 96);
          }
          if (details.y) {
            details.y = ((details.y - this.view.rectangle().y) / this.view.scale) * (this.view.dpi / 96);
          }
        }
        if (this.view instanceof Canvas3DView) {
          if (details.x) {
            details.x = ((details.x - this.view.rectangle().x) / this.view.scale) * (this.view.dpi / 96);
          }
          if (details.y) {
            details.y = ((details.y - this.view.rectangle().y) / this.view.scale) * (this.view.dpi / 96);
          }
        }
        return details;
      }
    }

    return undefined;
  }

  addEntity(entity: Entity) {
    if (this.entities.indexOf(entity) != -1) {
      return;
    }
    
    if (this.isActive) {
      this.entityActionBuffer.push({add: true, entity});
    } else {
      this.entities.push(entity);
    }
  }

  removeEntity(entity: Entity) {
    if (this.entities.indexOf(entity) == -1) {
      return;
    }

    if (this.isActive) {
      this.entityActionBuffer.push({ add: false, entity });
    } else {
        this.entities.splice(this.entities.indexOf(entity), 1);
      }
  }

  moveEntity(entity: Entity, sceneKey: string) {
    this.removeEntity(entity);
    this.engine.addEntity(sceneKey, entity);
  }

  async tick(): Promise<void> {

    if (!this.isActive) {
      return;
    }

    // const entitiesToAdd = this.entityAddBuffer.splice(0, this.entityAddBuffer.length);
    // entitiesToAdd.forEach(entity => {
    //   this.entities.push(entity);
    // });
    // const entitiesToRemove = this.entityRemoveBuffer.splice(0, this.entityRemoveBuffer.length);
    // entitiesToRemove.forEach(entity => {
    //   this.entities.splice(this.entities.indexOf(entity), 1);
    // });

    const entitiesToAction = this.entityActionBuffer.splice(0, this.entityActionBuffer.length);
    entitiesToAction.forEach(action => {
      if (action.add) {
        this.entities.push(action.entity);
      } else {
        if (this.entities.indexOf(action.entity) != -1) {
          this.entities.splice(this.entities.indexOf(action.entity), 1);
        }
      }
    })

    for (let i = 0; i < this.controllers.length; i++) {
      await this.controllers[i].tick();
    }

    for (let i = 0; i < this.entities.length; i++) {
      await (this.entities[i].tick(this) || Promise.resolve());
    }
  }

  debugInfo(info: any): void {
    this.view.debugInfo(info);
  }

  async draw(): Promise<void> {
    if (!this.isActive) {
      return;
    }

    await this.view.draw(this.entities);
  }

  load(data: any) {
    this.entities = [];
    data.entities.forEach((edata: any) => {
      const ctor = Engine.constructors[edata.type];
      this.entities.push(ctor(edata) as Entity);
    });
  }
}