import { Type } from "@angular/core";
import { Entity, Scene } from "game-engine";
import { AngularPainter } from "./angular-painter";
import { ObserverEngine } from "./observer-engine";

export class AngularEntity extends Entity {
    protected entities: AngularEntity[] = [];

    constructor(private template: Type<any>, public key: string) {
        super(new AngularPainter(template, key));
        (this.painter as AngularPainter).init(this);
    }

    addEntity(entity: AngularEntity) {
        this.entities.push(entity);
    }

    getEntities(): AngularEntity[] {
        return this.entities;
    }

    async tick(scene: Scene): Promise<void> {
        for (let i = 0; i < this.entities.length; i++) {
            await this.entities[i].tick(scene);
        }

        (this.painter as AngularPainter).setEntities(this.entities);
    }

    override save(): EntitySaveData {
        return {
            ...super.save(),
            template: this.template,
            type: '',
            key: this.key,
            entities: this.entities.map(entity => entity.save())
        }
    }

    override load(data: EntitySaveData) {
        this.template = data.template;
        this.key = data.key;
        this.painter = new AngularPainter(this.template, this.key);
        (this.painter as AngularPainter).init(this);
        this.entities = data.entities.map(edata => {
            const ctor = ObserverEngine.constructors[edata.type];
            return ctor(edata) as AngularEntity;
        });
        super.load(data);
    }
}



export type EntitySaveData = {
    type: string,
    template: Type<any>,
    key: string,
    entities: EntitySaveData[]
}