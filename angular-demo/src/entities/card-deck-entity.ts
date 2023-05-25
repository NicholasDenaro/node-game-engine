import { AngularEntity, AngularPainter, EntitySaveData } from "game-engine-angular";
import { Scene } from "game-engine";
import { CardDeckComponent } from "src/app/card-deck/card-deck.component";
import { ObserverEngine } from "src/utils/observer-engine";
import { CardEntity } from "./card-entity";

export class CardDeckEntity extends AngularEntity {

  cardsShown: number = 1;
  public cardWidth: string = '';
  public cardHeight: string = '';

  constructor(placement: string, public revealTop: boolean, public canDraw: boolean,) {
    super(CardDeckComponent, placement);
  }

  setSize(size: { width: string, height: string }) {
    this.cardWidth = size.width;
    this.cardHeight = size.height;
    this.entities.forEach(entity => (entity as any).setSize ? (entity as any).setSize(size) : console.log(size));
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

  override async tick(scene: Scene): Promise<void> {
    await super.tick(scene);
    if (this.entities.length > 0) {
      const shownCards = this.entities.slice(Math.max(this.entities.length - this.cardsShown, 0));
      (this.painter as AngularPainter).setEntities(shownCards);
    }
  }

  drawCard(): CardEntity | null {
    if (this.count() > 0) {
      return this.entities.pop() as CardEntity;
    }

    return null;
  }

  peekCard(): CardEntity {
    return this.entities[this.entities.length - 1] as CardEntity;
  }

  shuffle() {
    for (let i = this.entities.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.entities[i], this.entities[j]] = [this.entities[j], this.entities[i]];
    }
  }

  override save(): EntitySaveData | any {
    ObserverEngine.constructors[CardDeckEntity.name as any] = (edata) => {
      const cse = new CardDeckEntity('', false, false);
      cse.load(edata);
      return cse;
    }
    return {
      ...super.save(),
      type: CardDeckEntity.name,
      revealTop: this.revealTop,
      canDraw: this.canDraw,
      cardsShown: this.cardsShown,
      //width: this.cardWidth,
      //height: this.cardHeight
    }
  }

  override load(edata: any) {
    this.revealTop = edata.revealTop;
    this.canDraw = edata.canDraw;
    this.cardsShown = edata.cardsShown;
    super.load(edata);
  }
}