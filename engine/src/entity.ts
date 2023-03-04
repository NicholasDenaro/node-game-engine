import { Painter } from "./painter";
import { Scene } from "./scene";
import { ticker } from "./ticker";

export abstract class Entity implements ticker {

    static guid: number = 0;
    private id: number;
    getId(): number {
        return this.id;
    };

    constructor(public painter:Painter) {
        this.id = Entity.guid++;
    }

    abstract tick(scene: Scene): Promise<void>;

    save(): {} {
        return {
            id: this.id
        };
    }

    load(data: any): void {
        this.id = data.id;
    }
}