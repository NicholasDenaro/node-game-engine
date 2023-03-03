import { CardStackComponent } from "src/app/card-stack/card-stack.component";
import { AngularEntity } from "../utils/angular-entity";
import { CardEntity } from "./card-entity";

export class CardStackEntity extends AngularEntity {
    count = 0;
    constructor(placement: string) {
        super(CardStackComponent, placement);
    }

    addCard(card: CardEntity) {
        super.addEntity(card);
        this.count++;
    }

    override addEntity(entity: AngularEntity): void {
        if (entity instanceof CardEntity) {
            this.addCard(entity);
        }
    }

    drawCards(amount: number): CardEntity[] {
        this.count -= amount;
        return this.entities.splice(this.entities.length - amount) as CardEntity[];
    }

    peekCard(): CardEntity {
        return this.entities[this.entities.length - 1] as CardEntity;
    }

    cards(): CardEntity[] {
        return this.entities as CardEntity[];
    }

    hasCards() {
        return this.count > 0;
    }
}