import { Scene } from "game-engine";
import { CardDeckEntity } from "./card-deck-entity";
import { CardEntity } from "./card-entity";
import { CardStackEntity } from "./card-stack-entity";
import { GameRules } from "./game-rules";

export class SolitaireRules implements GameRules {

  ruleKeys = {
    deal3: 'deal 3',
    kings: 'only kings on empty',
    norules: 'no rules'
  };

  options = [
    {
      name: 'deal 3',
      type: 'toggle',
      value: true,
      callback: (val: any) => {this.options!.find(opt => opt.name == 'deal 3')!.value = val.srcElement.checked}
    },
    {
      name: 'only kings on empty',
      type: 'toggle',
      value: true,
      callback: (val: any) => {this.options!.find(opt => opt.name == 'only kings on empty')!.value = val.srcElement.checked}
    },
    {
      name: 'no rules',
      type: 'toggle',
      value: false,
      callback: (val: any) => {this.options!.find(opt => opt.name == 'no rules')!.value = val.srcElement.checked}
    }
  ];

  getOption(name: string) {
    return this.options.find(option => option.name == name)?.value;
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
    for (let i = 0; i < (this.getOption('deal 3') ? 3 : 1); i++) {
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
    if (this.getOption(this.ruleKeys.norules)) {
      return true;
    }

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
    if (this.getOption(this.ruleKeys.norules)) {
      return true;
    }

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

        if (dropTo.count == 0 && !this.getOption(this.ruleKeys.kings)) {
          return true;
        }
    
        const cardTo = dropTo.peekCard();
        return cardTo && cardTo.isUp && (Number.parseInt(cardTo.value) == Number.parseInt(toCheck.value) + 1) && toCheck.isOppositeSuit(cardTo) && dropTo != this.dealtStack;
    }
  }

  autoPlay(held: any): void {
    if(held) {
      return;
    }

    // Sort aces from dealth, only if deal3 is off
    const dealtCard = this.dealtStack.peekCard();
    if (!this.getOption(this.ruleKeys.deal3)) {
      if (dealtCard && Number.parseInt(dealtCard.value) == 1) {
        // dealt stack
        if (this.sort1.count == 0) {
          this.sort1.addCard(this.dealtStack.drawCard()!);
        }
        else if (this.sort2.count == 0) {
          this.sort2.addCard(this.dealtStack.drawCard()!);
        }
        else if (this.sort3.count == 0) {
          this.sort3.addCard(this.dealtStack.drawCard()!);
        }
        else if (this.sort4.count == 0) {
          this.sort4.addCard(this.dealtStack.drawCard()!);
        }
        return;
      }
    }
    

    for (let i = 0 ; i< this.stacks.length; i++) {
      const stack = this.stacks[i];
      const cards = stack.cards();
      const card = cards[cards.length - 1];
      if (!card) {
        continue;
      }

      // Flip cards
      if (!card.isUp) {
        card.makeFaceUp();
        return;
      }

      // Sort aces
      if (Number.parseInt(card.value) == 1) {
        // stack card
        if (this.sort1.count == 0) {
          this.sort1.addCard(stack.drawCards(1)[0]);
        }
        else if (this.sort2.count == 0) {
          this.sort2.addCard(stack.drawCards(1)[0]);
        }
        else if (this.sort3.count == 0) {
          this.sort3.addCard(stack.drawCards(1)[0]);
        }
        else if (this.sort4.count == 0) {
          this.sort4.addCard(stack.drawCards(1)[0]);
        }
      }

      // Send to sorting piles
      if (this.deck.count == 0 && this.dealtStack.count == 0) {
        if (this.allCardsUp()) {
          if (this.canDropTo(this.sort1, stack, card)) {
            const drop = stack.drawCards(1);
            this.sort1.addCard(drop[0]);
            return;
          }
          if (this.canDropTo(this.sort2, stack, card)) {
            const drop = stack.drawCards(1);
            this.sort2.addCard(drop[0]);
            return;
          }
          if (this.canDropTo(this.sort3, stack, card)) {
            const drop = stack.drawCards(1);
            this.sort3.addCard(drop[0]);
            return;
          }
          if (this.canDropTo(this.sort4, stack, card)) {
            const drop = stack.drawCards(1);
            this.sort4.addCard(drop[0]);
            return;
          }
        }
      }
    }
  }

  private allCardsUp(): boolean {
    return this.stacks.every(stack => stack.cards().every(card => card.isUp));
  }
}