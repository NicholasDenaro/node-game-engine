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

  abstract tick(scene: Scene): Promise<void> | void;

  save(): {} {
    return {
      id: this.id
    };
  }

  load(data: any): void {
    this.id = data.id;
  }
}