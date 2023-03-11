import { Scene } from "game-engine";
import { CardDeckComponent } from "src/app/card-deck/card-deck.component";
import { AngularEntity, EntitySaveData } from "src/utils/angular-entity";
import { AngularPainter } from "src/utils/angular-painter";
import { ObserverEngine } from "src/utils/observer-engine";
import { CardEntity } from "./card-entity";

export class CardDeckEntity extends AngularEntity {
    
    cardsShown: number = 1;
    public cardWidth: string = '';
    public cardHeight: string = '';

    constructor(placement: string, public revealTop: boolean, public canDraw: boolean, size: {width: string, height: string}) {
        super(CardDeckComponent, placement);
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
            const cse =  new CardDeckEntity('', false, false, {width: edata.width, height: edata.height});
            cse.load(edata);
            return cse;
        }
        return {
            ...super.save(),
            type: CardDeckEntity.name,
            revealTop: this.revealTop,
            canDraw: this.canDraw,
            cardsShown: this.cardsShown,
            width: this.cardWidth,
            height: this.cardHeight
        }
    }

    override load(edata: any) {
        this.revealTop = edata.revealTop;
        this.canDraw = edata.canDraw;
        this.cardsShown = edata.cardsShown;
        super.load(edata);
    }
}