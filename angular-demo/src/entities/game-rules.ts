import { Scene } from "game-engine";
import { EngineStateService } from "src/app/engine-state.service";
import { CardDeckEntity } from "./card-deck-entity";
import { CardEntity } from "./card-entity";
import { CardStackEntity } from "./card-stack-entity";

export interface GameRules {
    options: {name: string, type: string, value: any, callback: (val: any) => void}[];
    getOption(name: string): any;
    init(engine:EngineStateService, scene: Scene): void;
    canDropTo(dropTo: CardDeckEntity | CardStackEntity, cardLastFrom: CardDeckEntity | CardStackEntity, held: CardEntity | CardStackEntity | null): boolean;
    deal(deck: CardDeckEntity): void;
    cycleDeck(deck: CardDeckEntity): void;
    pickUp(deck: CardDeckEntity): CardEntity | null;
    canPickUpStack(stack: CardStackEntity, pickupCount: number): boolean;
    autoPlay(held: any): boolean;
    rebind(scene: Scene): void;
}