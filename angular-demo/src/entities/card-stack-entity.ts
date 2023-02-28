import { CardStackComponent } from "src/app/card-stack/card-stack.component";
import { AngularEntity } from "../utils/angular-entity";

export class CardStackEntity extends AngularEntity {
    constructor(placement: string, private topVisible: boolean) {
        super(CardStackComponent, placement);
    }
}