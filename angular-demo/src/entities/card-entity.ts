import { CardComponent } from "src/app/card/card.component";
import { AngularEntity } from "../utils/angular-entity";

export class CardEntity extends AngularEntity {
    constructor(public suit: string, public value: string) {
        super(CardComponent, 'cards');
    }
}