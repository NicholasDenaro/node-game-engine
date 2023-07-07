import { CanActivate } from "./can-activate";
import { Entity } from "./entity";

export interface View extends CanActivate {
    debugInfo(info: any): void;
    draw(entities: Array<Entity>): Promise<void>;
    viewElement(): HTMLElement;
    hasElement(element: Element | EventTarget): boolean;
}