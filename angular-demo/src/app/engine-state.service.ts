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

  pickUp(card: CardEntity) {
    if (!this.isHolding()) {
      this.heldCard = card;
      this.scene.addEntity(card);
      this.engine.doTick();
    }
  }

  pickUpStack(stack: CardEntity[]) {
    if (!this.isHolding()) {
      this.heldStack = new CardStackEntity('cards');
      stack.forEach(card => {
        this.heldStack?.addCard(card);
      });

      this.scene.addEntity(this.heldStack);
      this.engine.doTick();
    }
  }

  drop(cardHolder: CardDeckEntity | CardStackEntity) {
    if (this.isHolding()) {
      if (this.heldCard) {
        this.scene.removeEntity(this.heldCard!);
        cardHolder.addEntity(this.heldCard!);
        this.heldCard = null;
        this.engine.doTick();
      }
      else if (this.heldStack) {
        this.scene.removeEntity(this.heldStack!);
        this.heldStack.cards().forEach(card => {
          cardHolder.addEntity(card);
        });
        this.heldStack = null;
        this.engine.doTick();
      }
    }
  }

  isHolding(): boolean {
    return this.heldCard !== null || this.heldStack !== null;
  }
}
