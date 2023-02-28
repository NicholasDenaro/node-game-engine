import { Type } from "@angular/core";
import { Entity, Scene } from "game-engine";
import { AngularPainter } from "./angular-painter";

export class AngularEntity extends Entity {
    protected entities: AngularEntity[] = [];

    constructor(template: Type<any>, key: string) {
        super(new AngularPainter(template, key));
        (this.painter as AngularPainter).init(this);
    }

    addEntity(entity: AngularEntity) {
        this.entities.push(entity);
    }

    async tick(scene: Scene): Promise<void> {
        for (let i = 0; i < this.entities.length; i++) {
            await this.entities[i].tick(scene);
        }

        (this.painter as AngularPainter).setEntities(this.entities);
    }
}