import { Scene } from "game-engine";
import { CardComponent } from "src/app/card/card.component";
import { ObserverEngine } from "src/utils/observer-engine";
import { AngularEntity, EntitySaveData } from "../utils/angular-entity";
import { Holdable } from "./holdable";

export class CardEntity extends AngularEntity implements Holdable {

  width: string = '10px';
  height: string = '14px';

  constructor(public suit: string, public value: string, public isUp: boolean) {
    super(CardComponent, 'cards');
    this.isUp = isUp;
  }

  override async tick(scene: Scene): Promise<void> {
    await super.tick(scene);
  }

  setSize(size: { width: string, height: string }) {
    this.width = size.width;
    this.height = size.height;
  }

  makeFaceDown() {
    this.isUp = false;
  }

  makeFaceUp() {
    this.isUp = true;
  }

  isOppositeSuit(other: CardEntity): boolean {
    switch (this.suit) {
      case '♠':
      case '♣':
        return other.suit == '♥' || other.suit == '♦';
      case '♥':
      case '♦':
        return other.suit == '♠' || other.suit == '♣';
    }

    return false;
  }

  override save(): EntitySaveData | any {
    ObserverEngine.constructors[CardEntity.name as any] = (edata) => {
      const cse = new CardEntity('', '0', true);
      cse.load(edata);
      return cse;
    }
    return {
      ...super.save(),
      type: CardEntity.name,
      suit: this.suit,
      value: this.value,
      isUp: this.isUp,
      //width: this.width,
      //height: this.height,
    }
  }

  override load(edata: any) {
    this.suit = edata.suit;
    this.value = edata.value;
    this.isUp = edata.isUp;
    //this.width = edata.width;
    //this.height = edata.height;
  }
}