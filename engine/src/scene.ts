import { CanActivate } from "./can-activate";
import { Controller, ControllerState } from "./controller";
import { Entity } from "./entity";
import { View } from "./view";

export class Scene implements CanActivate {

    constructor(private view: View) {

    }

    private entitites = new Array<Entity>();
    private entityAddBuffer = new Array<Entity>();
    private entityRemoveBuffer = new Array<Entity>();
    private controllers = new Array<Controller>();

    private isActive = false;

    activate() {
        this.isActive = true;
        document.body.appendChild(this.view.viewElement());
    }

    deactivate() {
        this.isActive = false;
        document.body.removeChild(this.view.viewElement());
    }

    addController(controller: Controller) {
        this.controllers.push(controller);
    }

    isControl(binding: string, state: ControllerState) {
        for (let i = 0 ; i < this.controllers.length; i++) {
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
            this.entitites.push(entity);
        }
    }

    removeEntity(entity: Entity) {
        if (this.isActive) {
            this.entityRemoveBuffer.push(entity);
        } else {
            this.entitites.splice(this.entitites.indexOf(entity), 1);
        }
    }

    async tick(): Promise<void> {

        if (!this.isActive) {
            return;
        }
        
        const entitiesToAdd = this.entityAddBuffer.splice(0, this.entityAddBuffer.length);
        entitiesToAdd.forEach(entity => {
            this.entitites.push(entity);
        });
        const entitiesToRemove = this.entityRemoveBuffer.splice(0, this.entityRemoveBuffer.length);
        entitiesToRemove.forEach(entity => {
            this.entitites.splice(this.entitites.indexOf(entity), 1);
        });

        for (let i = 0; i < this.controllers.length; i++) {
            await this.controllers[i].tick();
        }

        for (let i = 0; i < this.entitites.length; i++) {
            await this.entitites[i].tick(this);
        }
    }

    debugInfo(info: any): void {
        this.view.debugInfo(info);
    }

    async draw(): Promise<void> {
        if (!this.isActive) {
            return;
        }

        await this.view.draw(this.entitites);
    }
}