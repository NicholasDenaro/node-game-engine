import { Scene } from "game-engine";
import { EngineStateService } from "src/app/engine-state.service";
import { CardDeckEntity } from "../card-deck-entity";
import { CardEntity } from "../card-entity";
import { CardStackEntity } from "../card-stack-entity";
import { Holdable, Holder } from "../holdable";

export interface CardGameRules extends GameRules {
  cardColumns: number;
  cardRows: number;
  cardStackSize: number;
  deal(deck: CardDeckEntity): void;
  cycleDeck(deck: CardDeckEntity): void;
  pickUp(deck: CardDeckEntity): CardEntity | null;
  canPickUpStack(stack: CardStackEntity, pickupCount: number): boolean;
}

export interface GameRules {
  init(engine: EngineStateService, scene: Scene): void;
  viewOption: string;
  options: { name: string, type: string, value: any, callback: (val: any) => void }[];
  getOption(name: string): any;
  canDropTo(dropTo: Holder, lastFrom: Holder, held: Holdable | null): boolean;
  pickUp(entity: Holdable): CardEntity | null;
  rebind(scene: Scene): void;
  autoPlay(held: any): boolean;
}