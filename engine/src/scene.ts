import { CanActivate } from "./can-activate.js";
import { Engine } from "./engine.js";
import { Entity } from "./entity.js";
import { View } from "./view.js";

export class Scene implements CanActivate {

  constructor(public readonly key: string, private view: View) {

  }

  getView(): View {
    return this.view;
  }

  private entities = new Array<Entity>();
  public entitiesSlice(filter: (entity: Entity) => boolean): Entity[] {
    return this.entities.filter(filter).slice();
  }

  public entitiesByType<TType extends Entity>(constructor: new (...args: any[]) => TType): TType[] {
    return <TType[]>this.entitiesSlice(entity => entity instanceof constructor);
  }

  private entityActionBuffer = new Array<{add: boolean, entity: Entity}>();

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

  addEntity(entity: Entity) {
    if (this.entities.indexOf(entity) != -1) {
      return;
    }
    
    if (this.isActive) {
      this.entityActionBuffer.push({add: true, entity});
    } else {
      if (this.entityActionBuffer.length > 0) {
        this.flushEntityActions();
      }
      this.entities.push(entity);
      entity.add(this);
    }
  }

  removeEntity(entity: Entity) {
    if (this.entities.indexOf(entity) == -1) {
      return;
    }

    if (this.isActive) {
      this.entityActionBuffer.push({ add: false, entity });
    } else {
      if (this.entityActionBuffer.length > 0) {
        this.flushEntityActions();
      }
      const removedEntity = this.entities.splice(this.entities.indexOf(entity), 1)[0];
      removedEntity.remove(this);
    }
  }

  flushEntityActions() {
    const entitiesToAction = this.entityActionBuffer.splice(0, this.entityActionBuffer.length);
    entitiesToAction.forEach(action => {
      if (action.add) {
        if (this.entities.indexOf(action.entity) === -1) {
          this.entities.push(action.entity);
          action.entity.add(this);
        }
      } else {
        if (this.entities.indexOf(action.entity) != -1) {
          const removedEntity = this.entities.splice(this.entities.indexOf(action.entity), 1)[0];
          removedEntity.remove(this);
        }
      }
    });
  }

  async tick(engine: Engine): Promise<void> {

    if (!this.isActive) {
      return;
    }

    this.flushEntityActions();

    for (let i = 0; i < this.entities.length; i++) {
      await (this.entities[i].pretick(engine, this) || Promise.resolve());
    }
    for (let i = 0; i < this.entities.length; i++) {
      await (this.entities[i].tick(engine, this) || Promise.resolve());
    }
    for (let i = 0; i < this.entities.length; i++) {
      await (this.entities[i].posttick(engine, this) || Promise.resolve());
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