import { Injectable } from '@angular/core';
import { Painter, Scene } from 'game-engine';
import { Subject } from 'rxjs';
import { CardDeckEntity } from 'src/entities/card-deck-entity';
import { CardEntity } from 'src/entities/card-entity';
import { CardStackEntity } from 'src/entities/card-stack-entity';
import { Holdable, Holder } from 'src/entities/holdable';
import { CardGameRules, GameRules } from 'src/entities/rules/game-rules';
import { SolitaireRules } from 'src/entities/rules/solitaire-state';
import { SpiderRules } from 'src/entities/rules/spider-state';
import { AngularEntity, AngularView } from 'game-engine-angular';
import { sizeCards } from 'src/utils/card-sizer';
import { ObserverEngine } from 'src/utils/observer-engine';

@Injectable({
  providedIn: 'root'
})
export class EngineStateService {
  engine: ObserverEngine = new ObserverEngine();
  scene!: Scene;
  heldEntity: (AngularEntity & Holdable) | null = null;
  cardLastFrom!: CardStackEntity | CardDeckEntity;

  rules: GameRules | CardGameRules | null = null;

  game: string = 'Klondike';
  private readonly gameSubject = new Subject<string>();
  private readonly resetSubject = new Subject<any>();
  private readonly resizeSubject = new Subject<any>();

  stacks: CardStackEntity[] = [];

  constructor() {
  }

  game$() {
    return this.gameSubject.asObservable();
  }

  reset$() {
    return this.resetSubject.asObservable();
  }

  resize$() {
    return this.resizeSubject.asObservable();
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

    this.engine.resetStates();
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
        if (this.rules?.autoPlay(this.heldEntity)) {
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
    this.resizeSubject.next({});
    this.engine.draw();
  }

  redo() {
    this.engine.redo();
    this.rules?.rebind(this.scene);
    this.resizeSubject.next({});
    this.engine.draw();
  }

  reset() {
    this.resetSubject.next({});
    this.scene?.deactivate();
    this.scene = new Scene(this.view);

    this.engine.addScene('main', this.scene);

    this.rules?.init(this, this.scene);

    this.scene.activate();
  }

  deal(deck: CardDeckEntity) {
    (this.rules as CardGameRules)?.deal(deck);
    this.engine.doTick();
  }

  cycleDeck(deck: CardDeckEntity) {
    (this.rules as CardGameRules)?.cycleDeck(deck);
    this.engine.doTick();
  }

  pickUp(from: CardDeckEntity) {
    if (!this.isHolding()) {
      const card = this.rules?.pickUp(from);
      if (card) {
        this.heldEntity = card;
        this.cardLastFrom = from;
        this.scene.addEntity(card);
      }
      this.engine.doTick(false);
    }
  }

  pickUpStack(from: CardStackEntity, pickupCount: number) {
    if (!this.isHolding()) {
      if ((this.rules as CardGameRules)?.canPickUpStack(from, pickupCount)) {
        const cse = new CardStackEntity('cards');
        this.heldEntity = cse;
        cse.setSize(sizeCards(this.rules as CardGameRules));
        from.drawCards(pickupCount).forEach(card => {
          cse?.addCard(card);
        });
  
        this.cardLastFrom = from;
        this.scene.addEntity(cse);
      }
      this.engine.doTick(false);
    }
  }

  drop(dropTo: CardDeckEntity | CardStackEntity) {
    if (this.isHolding()) {
      // Single Card
      if (this.heldEntity) {
        if(this.canDropTo(dropTo)) {
          this.scene.removeEntity(this.heldEntity!);
          if (this.heldEntity instanceof CardEntity) {
            dropTo.addEntity(this.heldEntity!);
          }
          else if (this.heldEntity instanceof CardStackEntity) {
            this.heldEntity.cards().forEach(card => {
              dropTo.addEntity(card);
            });
          }
          this.heldEntity = null;
          this.engine.doTick();
        }
      }
    }
  }

  canDropTo(dropTo: Holder): boolean {
    return this.rules?.canDropTo(dropTo, this.cardLastFrom, this.heldEntity) || false;
  }

  isHolding(): boolean {
    return this.heldEntity !== null;
  }
}


class StubPainter implements Painter {
  paint(args: any): void {
  }
}