import { Entity } from "./entity";

export interface View {
    debugInfo(info: any): void;
    draw(entities: Array<Entity>): Promise<void>;
    viewElement(): HTMLElement;
}