import { Scene } from "game-engine";
import { EngineStateService } from "src/app/engine-state.service";
import { sizeCards } from "src/utils/card-sizer";
import { CardDeckEntity } from "./card-deck-entity";
import { CardEntity } from "./card-entity";
import { CardStackEntity } from "./card-stack-entity";
import { GameRules } from "./game-rules";

export class SpiderRules implements GameRules {
    viewOption: string = 'Spider';
    options: { name: string; type: string; value: any; callback: (val: any) => void; }[] = [

    ];

    cardColumns = 10;
    cardRows = 2;
    cardStackSize = 20;
    
    deck: CardDeckEntity | null = null;
    stacks: CardStackEntity[] = [];

    getOption(name: string) {
        return false;
    }

    init(engine: EngineStateService, scene: Scene): void {
        const cardSize = sizeCards(this);
        cardSize.width = `calc(${cardSize.width} / 2)`;
        cardSize.height = `calc(${cardSize.height} / 2)`;
        this.deck = new CardDeckEntity('deck', true, true, cardSize);

        // Use 2 decks
        for (let i = 0; i < 2; i++) {
            for (let i = 0; i < 13; i++) {
                this.deck.addEntity(new CardEntity('♠', `${i + 1}`, false));
            }
            for (let i = 0; i < 13; i++) {
                this.deck.addEntity(new CardEntity('♥', `${i + 1}`, false));
            }
            for (let i = 0; i < 13; i++) {
                this.deck.addEntity(new CardEntity('♣', `${i + 1}`, false));
            }
            for (let i = 0; i < 13; i++) {
                this.deck.addEntity(new CardEntity('♦', `${i + 1}`, false));
            }
        }
        
        this.deck.shuffle();

        this.stacks = [];
        for (let i = 0; i < 10; i++) {
            scene.addEntity(this.stacks[i] = new CardStackEntity(`stack${i + 1}`, sizeCards(this)));
            for (let j = 0; j < (i < 4 ? 5 : 4); j++) {
                this.stacks[i].addCard(this.deck.drawCard()!);
            }
            const card = this.deck.drawCard()!;
            card.makeFaceUp();
            this.stacks[i].addCard(card);
        }

        scene.addEntity(this.deck);
    }

    canDropTo(dropTo: CardDeckEntity | CardStackEntity, cardLastFrom: CardDeckEntity | CardStackEntity, held: CardStackEntity | CardEntity | null): boolean {
        throw new Error("Method not implemented.");
    }

    deal(deck: CardDeckEntity): void {
        throw new Error("Method not implemented.");
    }

    cycleDeck(deck: CardDeckEntity): void {
        throw new Error("Method not implemented.");
    }

    pickUp(deck: CardDeckEntity): CardEntity | null {
        throw new Error("Method not implemented.");
    }

    canPickUpStack(stack: CardStackEntity, pickupCount: number): boolean {
        throw new Error("Method not implemented.");
    }

    autoPlay(held: any): boolean {
        return false;
    }

    rebind(scene: Scene): void {
        throw new Error("Method not implemented.");
    }
    
}