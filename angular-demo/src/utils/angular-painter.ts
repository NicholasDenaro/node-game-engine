import { Component, Type, ViewContainerRef } from "@angular/core";
import { Painter } from "game-engine";
import { AngularEntity } from "./angular-entity";
import { GameView } from "./view-ref-";

export class AngularPainter implements Painter {
    private entity!: AngularEntity;
    private entities: AngularEntity[] = [];
    constructor(private template: Type<Component & GameView>, private key: string) {

    }

    init(entity: AngularEntity) {
        this.entity = entity;
    }

    paint(args: {[key: string]: ViewContainerRef}): void {
        if (!args || !args[this.key]) return;
        const component = args[this.key].createComponent(this.template);
        component.instance.init(this.entity);
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