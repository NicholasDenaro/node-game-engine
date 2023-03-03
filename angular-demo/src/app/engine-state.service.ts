import { Injectable } from '@angular/core';
import { Scene } from 'game-engine';
import { CardDeckEntity } from 'src/entities/card-deck-entity';
import { CardEntity } from 'src/entities/card-entity';
import { CardStackEntity } from 'src/entities/card-stack-entity';
import { AngularView } from 'src/utils/angular-view';
import { ObserverEngine } from 'src/utils/observer-engine';

@Injectable({
  providedIn: 'root'
})
export class EngineStateService {
  engine: ObserverEngine = new ObserverEngine();
  scene!: Scene;
  heldCard: CardEntity | null = null;
  heldStack: CardStackEntity | null = null;
  cardLastFrom: CardStackEntity | CardDeckEntity | null = null;

  dealtStack = new CardDeckEntity('dealt', true, false);
  sort1 = new CardDeckEntity('sort1', true, false);
  sort2 = new CardDeckEntity('sort2', true, false);
  sort3 = new CardDeckEntity('sort3', true, false);
  sort4 = new CardDeckEntity('sort4', true, false);
  deck = new CardDeckEntity('deck', true, true);

  stacks: CardStackEntity[] = [];

  constructor() {
  }

  init(view: AngularView) {
    this.scene = new Scene(view);
    this.engine.addScene('main', this.scene);
    this.scene.addEntity(this.deck);
    this.scene.addEntity(this.dealtStack);
    this.scene.addEntity(this.sort1);
    this.scene.addEntity(this.sort2);
    this.scene.addEntity(this.sort3);
    this.scene.addEntity(this.sort4);

    for (let i = 0 ; i < 7; i++) {
      let stack = new CardStackEntity(`stack${i + 1}`);
      this.stacks.push(stack);
      this.scene.addEntity(stack);
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
        this.stacks[i].addCard(card);
      }

      let card = this.deck.drawCard();
      card.makeFaceUp();
      this.stacks[i].addCard(card);
    }

    this.scene.activate();

    this.engine.start();
    this.engine.doTick();
  }

  pickUp(from: CardDeckEntity) {
    if (!this.isHolding()) {
      const card = from.drawCard();
      this.heldCard = card;
      this.cardLastFrom = from;
      this.scene.addEntity(card);
      this.engine.doTick();
    }
  }

  pickUpStack(from: CardStackEntity, pickupCount: number) {
    if (!this.isHolding()) {
      this.heldStack = new CardStackEntity('cards');
      from.drawCards(pickupCount).forEach(card => {
        this.heldStack?.addCard(card);
      });

      this.cardLastFrom = from;
      this.scene.addEntity(this.heldStack);
      this.engine.doTick();
    }
  }

  drop(dropTo: CardDeckEntity | CardStackEntity) {
    if (this.isHolding()) {
      if (this.heldCard) {
        if(this.canDropTo(dropTo)) {
          this.scene.removeEntity(this.heldCard!);
          dropTo.addEntity(this.heldCard!);
          this.heldCard = null;
          this.engine.doTick();
        }
        
      }
      else if (this.heldStack) {
        if(this.canDropTo(dropTo)) {
          this.scene.removeEntity(this.heldStack!);
          this.heldStack.cards().forEach(card => {
            dropTo.addEntity(card);
          });
          this.heldStack = null;
          this.engine.doTick();
        }
      }
    }
  }

  canDropTo(dropTo: CardDeckEntity | CardStackEntity): boolean {

    if (dropTo == this.cardLastFrom) {
      return true;
    }

    let toCheck = this.heldCard || (this.heldStack?.getEntities()[0] as CardEntity);

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
    

    return false;
  }

  isHolding(): boolean {
    return this.heldCard !== null || this.heldStack !== null;
  }
}
