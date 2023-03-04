import { Injectable } from '@angular/core';
import { Painter, Painter2D, Scene } from 'game-engine';
import { CardDeckEntity } from 'src/entities/card-deck-entity';
import { CardEntity } from 'src/entities/card-entity';
import { CardStackEntity } from 'src/entities/card-stack-entity';
import { GameRules } from 'src/entities/game-rules';
import { SolitaireRules } from 'src/entities/solitaire-state';
import { AngularEntity } from 'src/utils/angular-entity';
import { AngularPainter } from 'src/utils/angular-painter';
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
  cardLastFrom!: CardStackEntity | CardDeckEntity;

  rules: GameRules | null = null;

  stacks: CardStackEntity[] = [];

  constructor() {
  }

  private view!: AngularView;
  init(view: AngularView) {
    this.view = view;
    this.rules = new SolitaireRules();

    this.reset();

    this.engine.start();
    this.engine.doTick();
    this.autoPlay();
  }

  private auto: NodeJS.Timer | null = null;
  autoPlay() {
    if (this.auto) {
      clearInterval(this.auto);
      this.auto = null;
      return;
    }

    this.auto = setInterval(() => {
        this.rules?.autoPlay(this.heldCard || this.heldStack);
        this.engine.doTick();
    }, 100);
  }

  reset() {
    this.scene?.deactivate();
    this.scene = new Scene(this.view);

    this.engine.addScene('main', this.scene);

    this.rules?.init(this.scene);

    this.scene.activate();
    this.engine.doTick();
  }

  deal(deck: CardDeckEntity) {
    this.rules?.deal(deck);
    this.engine.doTick();
  }

  cycleDeck(deck: CardDeckEntity) {
    this.rules?.cycleDeck(deck);
    this.engine.doTick();
  }

  pickUp(from: CardDeckEntity) {
    if (!this.isHolding()) {
      const card = this.rules?.pickUp(from);
      if (card) {
        this.heldCard = card;
        this.cardLastFrom = from;
        this.scene.addEntity(card);
      }
      this.engine.doTick();
    }
  }

  pickUpStack(from: CardStackEntity, pickupCount: number) {
    if (!this.isHolding()) {
      if (this.rules?.canPickUpStack(from, pickupCount)) {
        this.heldStack = new CardStackEntity('cards');
        from.drawCards(pickupCount).forEach(card => {
          this.heldStack?.addCard(card);
        });
  
        this.cardLastFrom = from;
        this.scene.addEntity(this.heldStack);
      }
      this.engine.doTick();
    }
  }

  drop(dropTo: CardDeckEntity | CardStackEntity) {
    if (this.isHolding()) {
      // Single Card
      if (this.heldCard) {
        if(this.canDropTo(dropTo)) {
          this.scene.removeEntity(this.heldCard!);
          dropTo.addEntity(this.heldCard!);
          this.heldCard = null;
          this.engine.doTick();
        }
        
      }
      // Stack
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
    return this.rules?.canDropTo(dropTo, this.cardLastFrom, this.heldCard || this.heldStack) || false;
  }

  isHolding(): boolean {
    return this.heldCard !== null || this.heldStack !== null;
  }
}


class StubPainter implements Painter {
  paint(args: any): void {
  }
}