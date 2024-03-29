import { AngularEntity, EntitySaveData } from "game-engine-angular";
import { CardStackComponent } from "src/app/card-stack/card-stack.component";
import { ObserverEngine } from "src/utils/observer-engine";
import { CardEntity } from "./card-entity";
import { Holdable } from "./holdable";

export class CardStackEntity extends AngularEntity implements Holdable {
  public cardWidth: string = '';
  public cardHeight: string = '';
  constructor(placement: string) {
    super(CardStackComponent, placement);
  }

  setSize(size: { width: string, height: string }) {
    this.cardWidth = size.width;
    this.cardHeight = size.height;
    this.entities.forEach(entity => (entity as any).setSize ? (entity as any).setSize(size) : '');
  }

  count(): number {
    return this.entities.length;
  }

  addCard(card: CardEntity) {
    super.addEntity(card);
    card.setSize({ width: this.cardWidth, height: this.cardHeight });
  }

  override addEntity(entity: AngularEntity): void {
    if (entity instanceof CardEntity) {
      this.addCard(entity);
    }
  }

  drawCards(amount: number): CardEntity[] {
    return this.entities.splice(this.entities.length - amount) as CardEntity[];
  }

  peekCard(): CardEntity {
    return this.entities[this.entities.length - 1] as CardEntity;
  }

  cards(): CardEntity[] {
    return this.entities as CardEntity[];
  }

  hasCards() {
    return this.entities.length > 0;
  }

  override save(): EntitySaveData | any {
    ObserverEngine.constructors[CardStackEntity.name as any] = (edata) => {
      const cse = new CardStackEntity('');
      cse.load(edata);
      return cse;
    }
    return {
      ...super.save(),
      type: CardStackEntity.name,
      cardWidth: this.cardWidth,
      cardHeight: this.cardHeight,
    }
  }
}