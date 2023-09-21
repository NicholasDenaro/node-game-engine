import { CanActivate } from "./can-activate.js";
import { Entity } from "./entity.js";

export interface View extends CanActivate {
    debugInfo(info: any): void;
    draw(entities: Array<Entity>): Promise<void> | void;
    viewElement(): HTMLElement;
    hasElement(element: Element | EventTarget): boolean;
}