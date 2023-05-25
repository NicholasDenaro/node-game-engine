import { Component, Type, ViewContainerRef } from "@angular/core";
import { Painter } from "game-engine";
import { AngularEntity } from "./angular-entity";
import { GameView } from "./game-view";

export class AngularPainter implements Painter {
  private entity!: AngularEntity;
  private entities: AngularEntity[] = [];
  constructor(private template: Type<Component & GameView>, private key: string) {

  }

  init(entity: AngularEntity) {
    this.entity = entity;
  }

  paint(args: { view: GameView, refs: { [key: string]: ViewContainerRef } }): void {
    if (!args || !args.refs[this.key]) {
      return;
    }

    const component = args.refs[this.key].createComponent(this.template);
    component.instance.init(this.entity);
    args.view.children.push(component.instance);
    for (let i = 0; i < this.entities.length; i++) {
      component.instance.hook().subscribe(() => {
        this.entities[i].painter.paint(component.instance.vcrs);
      });
    }
  }

  setEntities(entities: AngularEntity[]) {
    this.entities = entities;
  }
}