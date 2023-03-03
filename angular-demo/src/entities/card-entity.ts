import { Scene } from "game-engine";
import { CardComponent } from "src/app/card/card.component";
import { AngularEntity } from "../utils/angular-entity";

export class CardEntity extends AngularEntity {
    held: boolean = false;
    doPickup: boolean = false;
    doDrop: boolean = false;
    isUp: boolean = true;
    constructor(public suit: string, public value: string, isUp: boolean) {
        super(CardComponent, 'cards');
        this.isUp = isUp;
    }

    override async tick(scene: Scene): Promise<void> {
        await super.tick(scene);
    }

    pickUp() {
        this.held = true;
    }

    drop() {
        this.held = false;
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
}