import { Painter } from "./painter";
import { Scene } from "./scene";
import { ticker } from "./ticker";

export abstract class Entity implements ticker {

    static guid: number = 0;
    readonly id: number;

    constructor(public painter:Painter) {
        this.id = Entity.guid++;
    }

    abstract tick(scene: Scene): Promise<void>;
}