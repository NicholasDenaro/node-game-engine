import { Scene } from "game-engine";
import { EngineStateService } from "src/app/engine-state.service";
import { sizeCards } from "src/utils/card-sizer";
import { CardDeckEntity } from "./card-deck-entity";
import { CardEntity } from "./card-entity";
import { CardStackEntity } from "./card-stack-entity";
import { GameRules } from "./game-rules";

export class SolitaireRules implements GameRules {
  viewOption: string = 'Klondike'
  private engine: EngineStateService | null = null;
  private scene: Scene | null = null;
  ruleKeys = {
    deal3: 'deal 3',
    kings: 'only kings on empty',
    norules: 'no rules'
  };
  cardColumns = 7;
  cardRows = 2;
  cardStackSize = 20;

  options = [
    {
      name: 'deal 3',
      type: 'toggle',
      value: true,
      callback: async (val: any) => {
        this.setOption('deal 3', val.srcElement.checked);
        this.dealtStack.cardsShown = this.getOption('deal 3') ? 3 : 1;
        await this.dealtStack.tick(this.scene!);
        this.engine?.engine.draw();
      }
    },
    {
      name: 'only kings on empty',
      type: 'toggle',
      value: true,
      callback: (val: any) => { this.options!.find(opt => opt.name == 'only kings on empty')!.value = val.srcElement.checked }
    },
    {
      name: 'no rules',
      type: 'toggle',
      value: false,
      callback: (val: any) => { this.options!.find(opt => opt.name == 'no rules')!.value = val.srcElement.checked }
    }
  ];

  getOption(name: string) {
    return this.options.find(option => option.name == name)?.value;
  }

  private setOption(name: string, val: any) {
    this.options!.find(opt => opt.name == name)!.value = val;
  }

  dealtStack = new CardDeckEntity('dealt', true, false);
  sort1 = new CardDeckEntity('sort1', true, false);
  sort2 = new CardDeckEntity('sort2', true, false);
  sort3 = new CardDeckEntity('sort3', true, false);
  sort4 = new CardDeckEntity('sort4', true, false);
  deck = new CardDeckEntity('deck', true, true);

  stacks: CardStackEntity[] = [];

  init(engine: EngineStateService, scene: Scene) {
    this.engine = engine;
    this.scene = scene;
    scene.addEntity(this.deck = new CardDeckEntity('deck', true, true));
    this.deck.setSize(sizeCards(this));
    scene.addEntity(this.dealtStack = new CardDeckEntity('dealt', true, false));
    this.dealtStack.setSize(sizeCards(this));
    this.dealtStack.cardsShown = this.getOption('deal 3') ? 3 : 1;
    scene.addEntity(this.sort1 = new CardDeckEntity('sort1', true, false));
    this.sort1.setSize(sizeCards(this));
    scene.addEntity(this.sort2 = new CardDeckEntity('sort2', true, false));
    this.sort2.setSize(sizeCards(this));
    scene.addEntity(this.sort3 = new CardDeckEntity('sort3', true, false));
    this.sort3.setSize(sizeCards(this));
    scene.addEntity(this.sort4 = new CardDeckEntity('sort4', true, false));
    this.sort4.setSize(sizeCards(this));

    this.stacks = [];

    for (let i = 0; i < 7; i++) {
      let stack = new CardStackEntity(`stack${i + 1}`);
      stack.setSize(sizeCards(this));
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

    for (let i = 0; i < 7; i++) {
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

  rebind(scene: Scene) {
    this.deck = scene.entitiesSlice().find(entity => entity instanceof CardDeckEntity && entity.key == 'deck') as CardDeckEntity;
    this.deck.setSize(sizeCards(this));
    this.dealtStack = scene.entitiesSlice().find(entity => entity instanceof CardDeckEntity && entity.key == 'dealt') as CardDeckEntity;
    this.dealtStack.setSize(sizeCards(this));
    this.dealtStack.cardsShown = this.getOption('deal 3') ? 3 : 1;
    this.sort1 = scene.entitiesSlice().find(entity => entity instanceof CardDeckEntity && entity.key == 'sort1') as CardDeckEntity;
    this.sort1.setSize(sizeCards(this));
    this.sort2 = scene.entitiesSlice().find(entity => entity instanceof CardDeckEntity && entity.key == 'sort2') as CardDeckEntity;
    this.sort2.setSize(sizeCards(this));
    this.sort3 = scene.entitiesSlice().find(entity => entity instanceof CardDeckEntity && entity.key == 'sort3') as CardDeckEntity;
    this.sort3.setSize(sizeCards(this));
    this.sort4 = scene.entitiesSlice().find(entity => entity instanceof CardDeckEntity && entity.key == 'sort4') as CardDeckEntity;
    this.sort4.setSize(sizeCards(this));
    this.stacks = [];

    const indexFinder = /stack(?<index>[0-9]+)/;
    scene.entitiesSlice()
      .filter(entity => entity instanceof CardStackEntity && entity.key.indexOf('stack') > -1)
      .map(stack => stack as CardStackEntity)
      .forEach(stack => {
        this.stacks[Number.parseInt(indexFinder.exec(stack.key)?.groups?.['index'] as string) - 1] = stack;
        stack.setSize(sizeCards(this));
      });
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
      const cards = stack.getEntities() as CardEntity[];
      if (pickupCount == 1 && !cards[cards.length - 1].isUp) {
        cards[cards.length - 1].makeFaceUp();
        return false;
      }
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

    while (this.dealtStack.count() > 0) {
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
      if (dropTo.count() == 0 && Number.parseInt(toCheck.value) == 1) {
        return true;
      }

      const cardTo = dropTo.peekCard();
      return cardTo && cardTo.isUp && (Number.parseInt(cardTo.value) == Number.parseInt(toCheck.value) - 1) && toCheck.suit == cardTo.suit;
    }
    else {
      if (dropTo.count() == 0 && Number.parseInt(toCheck.value) == 13) {
        return true;
      }

      if (dropTo.count() == 0 && !this.getOption(this.ruleKeys.kings)) {
        return true;
      }

      const cardTo = dropTo.peekCard();
      return cardTo && cardTo.isUp && (Number.parseInt(cardTo.value) == Number.parseInt(toCheck.value) + 1) && toCheck.isOppositeSuit(cardTo) && dropTo != this.dealtStack;
    }
  }

  autoPlay(held: any): boolean {
    if (held) {
      return false;
    }

    // Sort aces from dealth, only if deal3 is off
    const dealtCard = this.dealtStack.peekCard();
    if (!this.getOption(this.ruleKeys.deal3)) {
      if (dealtCard && Number.parseInt(dealtCard.value) == 1) {
        // dealt stack
        if (this.sort1.count() == 0) {
          this.sort1.addCard(this.dealtStack.drawCard()!);
          return true;
        }
        else if (this.sort2.count() == 0) {
          this.sort2.addCard(this.dealtStack.drawCard()!);
          return true;
        }
        else if (this.sort3.count() == 0) {
          this.sort3.addCard(this.dealtStack.drawCard()!);
          return true;
        }
        else if (this.sort4.count() == 0) {
          this.sort4.addCard(this.dealtStack.drawCard()!);
          return true;
        }
      }
    }


    for (let i = 0; i < this.stacks.length; i++) {
      const stack = this.stacks[i];
      const cards = stack.cards();
      const card = cards[cards.length - 1];
      if (!card) {
        continue;
      }

      // Flip cards
      if (!card.isUp) {
        card.makeFaceUp();
        return true;
      }

      // Sort aces
      if (Number.parseInt(card.value) == 1) {
        // stack card
        if (this.sort1.count() == 0) {
          this.sort1.addCard(stack.drawCards(1)[0]);
          return true;
        }
        else if (this.sort2.count() == 0) {
          this.sort2.addCard(stack.drawCards(1)[0]);
          return true;
        }
        else if (this.sort3.count() == 0) {
          this.sort3.addCard(stack.drawCards(1)[0]);
          return true;
        }
        else if (this.sort4.count() == 0) {
          this.sort4.addCard(stack.drawCards(1)[0]);
          return true;
        }
      }

      // Send to sorting piles
      if (this.deck.count() == 0 && this.dealtStack.count() == 0) {
        if (this.allCardsUp()) {
          if (this.canDropTo(this.sort1, stack, card)) {
            const drop = stack.drawCards(1);
            this.sort1.addCard(drop[0]);
            return true;
          }
          if (this.canDropTo(this.sort2, stack, card)) {
            const drop = stack.drawCards(1);
            this.sort2.addCard(drop[0]);
            return true;
          }
          if (this.canDropTo(this.sort3, stack, card)) {
            const drop = stack.drawCards(1);
            this.sort3.addCard(drop[0]);
            return true;
          }
          if (this.canDropTo(this.sort4, stack, card)) {
            const drop = stack.drawCards(1);
            this.sort4.addCard(drop[0]);
            return true;
          }
        }
      }
    }

    return false;
  }

  private allCardsUp(): boolean {
    return this.stacks.every(stack => stack.cards().every(card => card.isUp));
  }
}