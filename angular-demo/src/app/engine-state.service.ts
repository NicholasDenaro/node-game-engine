import { Injectable } from '@angular/core';
import { Painter, Scene } from 'game-engine';
import { Subject } from 'rxjs';
import { CardDeckEntity } from 'src/entities/card-deck-entity';
import { CardEntity } from 'src/entities/card-entity';
import { CardStackEntity } from 'src/entities/card-stack-entity';
import { GameRules } from 'src/entities/game-rules';
import { SolitaireRules } from 'src/entities/solitaire-state';
import { SpiderRules } from 'src/entities/spider-state';
import { AngularView } from 'src/utils/angular-view';
import { sizeCards } from 'src/utils/card-sizer';
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

  game: string = 'Klondike';
  private readonly gameSubject = new Subject<string>();

  stacks: CardStackEntity[] = [];

  constructor() {
  }

  game$() {
    return this.gameSubject.asObservable();
  }

  setGame(game: string) {
    this.game = game;
    this.gameSubject.next(this.game);
  }

  private view!: AngularView;
  init(view: AngularView) {
    this.view = view;

    switch (this.game) {
      case 'Klondike':
        this.rules = new SolitaireRules();
        break;
      case 'Spider':
        this.rules = new SpiderRules();
        break;
    }
    

    this.reset();

    this.engine.start();
    this.engine.doTick();
    clearInterval(this.auto!);
    this.auto = null;
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
        if (this.rules?.autoPlay(this.heldCard || this.heldStack)) {
          this.engine.doTick();
        }
    }, 100);
  }

  hasMoreRedo() {
    return this.engine.hasMoreRedo();
  }

  undo() {
    this.engine.undo();
    this.rules?.rebind(this.scene);
  }

  redo() {
    this.engine.redo();
    this.rules?.rebind(this.scene);
  }

  reset() {
    this.scene?.deactivate();
    this.scene = new Scene(this.view);

    this.engine.addScene('main', this.scene);

    this.rules?.init(this, this.scene);

    this.scene.activate();
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
      this.engine.doTick(false);
    }
  }

  pickUpStack(from: CardStackEntity, pickupCount: number) {
    if (!this.isHolding()) {
      if (this.rules?.canPickUpStack(from, pickupCount)) {
        this.heldStack = new CardStackEntity('cards', sizeCards(this.rules));
        from.drawCards(pickupCount).forEach(card => {
          this.heldStack?.addCard(card);
        });
  
        this.cardLastFrom = from;
        this.scene.addEntity(this.heldStack);
      }
      this.engine.doTick(false);
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