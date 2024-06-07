import { Engine } from "./engine.js";
import { Painter } from "./painter.js";
import { Scene } from "./scene.js";
import { ticker } from "./ticker.js";

export type EntityID = number;

export abstract class Entity implements ticker {

  static guid: number = 0;
  private id: EntityID;
  getId(): number {
    return this.id;
  };

  constructor(public painter: Painter) {
    this.id = Entity.guid++;
    Engine.entities[this.id] = this;
  }

  abstract tick(engine: Engine, scene: Scene): Promise<void> | void;

  pretick(engine: Engine, scene: Scene): Promise<void> | void {

  }

  posttick(engine: Engine, scene: Scene): Promise<void> | void {

  }

  add(scene: Scene): void {
    
  }

  remove(scene: Scene): void {

  }

  save(): {} {
    return {
      id: this.id
    };
  }

  load(data: any): void {
    this.id = data.id;
  }
}