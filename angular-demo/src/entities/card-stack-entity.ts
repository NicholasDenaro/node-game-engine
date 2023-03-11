import { CardStackComponent } from "src/app/card-stack/card-stack.component";
import { ObserverEngine } from "src/utils/observer-engine";
import { AngularEntity, EntitySaveData } from "../utils/angular-entity";
import { CardEntity } from "./card-entity";

export class CardStackEntity extends AngularEntity {
    public cardWidth: string = '';
    public cardHeight: string = '';
    constructor(placement: string, size: {width: string, height: string}) {
        super(CardStackComponent, placement);
        this.cardWidth = size.width;
        this.cardHeight = size.height;
    }

    count(): number {
        return this.entities.length;
    }

    addCard(card: CardEntity) {
        super.addEntity(card);
        card.setSize(this.cardWidth, this.cardHeight);
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
            const cse =  new CardStackEntity('', {width: edata.cardWidth, height: edata.cardHeight});
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