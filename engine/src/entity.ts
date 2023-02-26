import { Paintable } from "./can-paint";
import { Painter } from "./painter";
import { Scene } from "./scene";
import { ticker } from "./ticker";

export abstract class Entity implements ticker {
    constructor(public painter:Painter) {

    }

    abstract tick(scene: Scene): Promise<void> | void;
}