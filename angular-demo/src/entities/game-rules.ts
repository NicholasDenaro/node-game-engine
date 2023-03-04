import { Scene } from "game-engine";
import { CardDeckEntity } from "./card-deck-entity";
import { CardEntity } from "./card-entity";
import { CardStackEntity } from "./card-stack-entity";

export interface GameRules {
    options: {name: string, type: string, value: any, callback: (val: any) => void}[];
    init(scene: Scene): void;
    canDropTo(dropTo: CardDeckEntity | CardStackEntity, cardLastFrom: CardDeckEntity | CardStackEntity, held: CardEntity | CardStackEntity | null): boolean;
    deal(deck: CardDeckEntity): void;
    cycleDeck(deck: CardDeckEntity): void;
    pickUp(deck: CardDeckEntity): CardEntity | null;
    canPickUpStack(stack: CardStackEntity, pickupCount: number): boolean;
    autoPlay(held: any): void;
}