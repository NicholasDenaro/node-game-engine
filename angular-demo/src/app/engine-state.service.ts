import { Injectable } from '@angular/core';
import { Scene } from 'game-engine';
import { CardDeckEntity } from 'src/entities/card-deck-entity';
import { CardEntity } from 'src/entities/card-entity';
import { CardStackEntity } from 'src/entities/card-stack-entity';
import { AngularEntity } from 'src/utils/angular-entity';
import { AngularView } from 'src/utils/angular-view';
import { ObserverEngine } from 'src/utils/observer-engine';
import { HandComponent } from './hand/hand.component';

@Injectable({
  providedIn: 'root'
})
export class EngineStateService {
  engine: ObserverEngine = new ObserverEngine();

  dealtStack = new CardDeckEntity('hand', true, false);
  deck = new CardDeckEntity('deck', false, true);

  constructor() {
  }

  init(view: AngularView) {
    const scene = new Scene(view);
    this.engine.addScene('main', scene);
    scene.addEntity(this.deck);
    scene.addEntity(this.dealtStack);
    for (let i = 0; i < 13; i++) {
      this.deck.addEntity(new CardEntity('♠', `${i + 1}`));
    }
    for (let i = 0; i < 13; i++) {
      this.deck.addEntity(new CardEntity('♥', `${i + 1}`));
    }
    for (let i = 0; i < 13; i++) {
      this.deck.addEntity(new CardEntity('♣', `${i + 1}`));
    }
    for (let i = 0; i < 13; i++) {
      this.deck.addEntity(new CardEntity('♦', `${i + 1}`));
    }
    this.deck.shuffle();
    scene.activate();

    this.engine.start();
    this.engine.doTick();
  }
}
