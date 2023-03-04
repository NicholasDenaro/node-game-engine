import { Scene } from "game-engine";
import { CardDeckEntity } from "./card-deck-entity";
import { CardEntity } from "./card-entity";
import { CardStackEntity } from "./card-stack-entity";
import { GameRules } from "./game-rules";

export class SolitaireRules implements GameRules {
    options = [
      {
        name: 'deal 3',
        type: 'toggle',
        value: true,
        callback: (val: any) => {this.options!.find(opt => opt.name == 'deal 3')!.value = val.srcElement.checked}
      }
    ];

    getOption(name: string) {
      return this.options.find(option => option.name == name);
    }
    
    dealtStack = new CardDeckEntity('dealt', true, false);
    sort1 = new CardDeckEntity('sort1', true, false);
    sort2 = new CardDeckEntity('sort2', true, false);
    sort3 = new CardDeckEntity('sort3', true, false);
    sort4 = new CardDeckEntity('sort4', true, false);
    deck = new CardDeckEntity('deck', true, true);

    stacks: CardStackEntity[] = [];

    init(scene: Scene) {
        scene.addEntity(this.deck = new CardDeckEntity('deck', true, true));
        scene.addEntity(this.dealtStack = new CardDeckEntity('dealt', true, false));
        scene.addEntity(this.sort1 = new CardDeckEntity('sort1', true, false));
        scene.addEntity(this.sort2 = new CardDeckEntity('sort2', true, false));
        scene.addEntity(this.sort3 = new CardDeckEntity('sort3', true, false));
        scene.addEntity(this.sort4 = new CardDeckEntity('sort4', true, false));
    
        this.stacks = [];
    
        for (let i = 0 ; i < 7; i++) {
          let stack = new CardStackEntity(`stack${i + 1}`);
          this.stacks.push(stack);
          scene.addEntity(stack);
        }
    
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
        this.deck.shuffle();
    
        for (let i = 0 ; i < 7; i++) {
          for (let j = 0; j < i; j++) {
            let card = this.deck.drawCard();
            if (card) {
              this.stacks[i].addCard(card);
            }
          }
    
          let card = this.deck.drawCard();
          if (card) {
            card.makeFaceUp();
            this.stacks[i].addCard(card);
          }
        }
    }

    deal(deck: CardDeckEntity) {
      for (let i = 0; i < (this.getOption('deal 3')?.value ? 3 : 1); i++) {
        const cardEntity = deck.drawCard();
        if (cardEntity) {
          cardEntity.makeFaceUp();
          this.dealtStack.addEntity(cardEntity);
        }
      }
    }

    pickUp(from: CardDeckEntity): CardEntity | null {
      return from.drawCard();
    }

    canPickUpStack(stack: CardStackEntity, pickupCount: number): boolean {
      const cards = stack.getEntities() as CardEntity[];
      if (cards[cards.length - pickupCount].isUp) {
        return true;
      }
      else {
        if (pickupCount == 1) {
          cards[cards.length - 1].makeFaceUp();
        }
      }

      return false;
    }

    cycleDeck(deck: CardDeckEntity): void {
        if (this.deck != deck) {
            return;
        }

        while (this.dealtStack.count > 0) {
            let card = this.dealtStack.drawCard();
            if (card) {
              card.makeFaceDown();
              this.deck.addCard(card);
            }
        }
    }

    canDropTo(dropTo: CardDeckEntity | CardStackEntity, cardLastFrom: CardDeckEntity | CardStackEntity, held: CardEntity | CardStackEntity): boolean {
        if (dropTo == cardLastFrom) {
            return true;
        }
      
        let toCheck = held instanceof CardEntity ? held : ((held as CardStackEntity)?.getEntities()[0] as CardEntity);
    
        if (dropTo == this.sort1 || dropTo == this.sort2 || dropTo == this.sort3 || dropTo == this.sort4) {
            if (dropTo.count == 0 && Number.parseInt(toCheck.value) == 1) {
                return true;
            }
        
            const cardTo = dropTo.peekCard();
            return cardTo && cardTo.isUp && (Number.parseInt(cardTo.value) == Number.parseInt(toCheck.value) - 1) && toCheck.suit == cardTo.suit;
        }
        else {
            if (dropTo.count == 0 && Number.parseInt(toCheck.value) == 13) {
                return true;
            }
        
            const cardTo = dropTo.peekCard();
            return cardTo && cardTo.isUp && (Number.parseInt(cardTo.value) == Number.parseInt(toCheck.value) + 1) && toCheck.isOppositeSuit(cardTo);
        }
    }
}