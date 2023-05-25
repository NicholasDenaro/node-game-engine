import { CanActivate } from "./can-activate";
import { Controller, ControllerState } from "./controller";
import { Engine } from "./engine";
import { Entity } from "./entity";
import { View } from "./view";

export class Scene implements CanActivate {

  constructor(private view: View) {

  }

  private entities = new Array<Entity>();
  public entitiesSlice(filter: (entity: Entity) => boolean) {
    return this.entities.filter(filter).slice();
  }
  public entitiesByType<TType extends Entity>(constructor: new (...args: any[]) => TType): TType[] {
    return <TType[]>this.entitiesSlice(entity => entity instanceof constructor);
  }
  private entityAddBuffer = new Array<Entity>();
  private entityRemoveBuffer = new Array<Entity>();
  private controllers = new Array<Controller>();

  private isActive = false;

  activate() {
    this.isActive = true;
  }

  deactivate() {
    this.isActive = false;
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

  addEntity(entity: Entity) {
    if (this.isActive) {
      this.entityAddBuffer.push(entity);
    } else {
      this.entities.push(entity);
    }
  }

  removeEntity(entity: Entity) {
    if (this.isActive) {
      this.entityRemoveBuffer.push(entity);
    } else {
      this.entities.splice(this.entities.indexOf(entity), 1);
    }
  }

  async tick(): Promise<void> {

    if (!this.isActive) {
      return;
    }

    const entitiesToAdd = this.entityAddBuffer.splice(0, this.entityAddBuffer.length);
    entitiesToAdd.forEach(entity => {
      this.entities.push(entity);
    });
    const entitiesToRemove = this.entityRemoveBuffer.splice(0, this.entityRemoveBuffer.length);
    entitiesToRemove.forEach(entity => {
      this.entities.splice(this.entities.indexOf(entity), 1);
    });

    for (let i = 0; i < this.controllers.length; i++) {
      await this.controllers[i].tick();
    }

    for (let i = 0; i < this.entities.length; i++) {
      await this.entities[i].tick(this);
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