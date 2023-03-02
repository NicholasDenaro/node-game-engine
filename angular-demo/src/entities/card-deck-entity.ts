import { Scene } from "game-engine";
import { CardDeckComponent } from "src/app/card-deck/card-deck.component";
import { AngularEntity } from "src/utils/angular-entity";
import { AngularPainter } from "src/utils/angular-painter";
import { CardEntity } from "./card-entity";

export class CardDeckEntity extends AngularEntity {
    count: number = 0;
    constructor(placement: string, public readonly revealTop: boolean, public readonly canDraw: boolean) {
        super(CardDeckComponent, placement);
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

    override async tick(scene: Scene): Promise<void> {
        await super.tick(scene);
        if (this.entities.length > 0) {
            (this.painter as AngularPainter).setEntities([this.entities[this.entities.length - 1]]);
        }
    }

    drawCard(): CardEntity {
        this.count--;
        return this.entities.pop() as CardEntity;
        
    }

    shuffle() {
        for (let i = this.entities.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.entities[i], this.entities[j]] = [this.entities[j], this.entities[i]];
        }
    }
}