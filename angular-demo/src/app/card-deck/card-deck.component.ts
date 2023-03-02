import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { CardDeckEntity } from 'src/entities/card-deck-entity';
import { GameView } from 'src/utils/game-view';
import { EngineStateService } from '../engine-state.service';
import {Subject, Observable} from 'rxjs';
import { CardEntity } from 'src/entities/card-entity';

@Component({
  selector: 'app-card-deck',
  templateUrl: './card-deck.component.html',
  styleUrls: ['./card-deck.component.less']
})
export class CardDeckComponent extends GameView implements OnInit, AfterViewInit {
  count: number = 0;
  revealTop: boolean = false;

  @ViewChild('topCard', {read: ViewContainerRef})
  vcr!: ViewContainerRef;

  constructor(private eref: ElementRef, private engineState: EngineStateService) {
    super();
  }

  ngAfterViewInit() {
    this.vcrs.refs['cards'] = this.vcr;
    this.doHook(this.eref.nativeElement);
  }

  ngOnInit(): void {
    this.count = (this.entity as CardDeckEntity).count;
    this.revealTop = (this.entity as CardDeckEntity).revealTop;
  }

  @HostListener('click')
  onClick() {
    if (!this.engineState.isHolding() && (this.entity as CardDeckEntity).canDraw) {
      if ( (this.entity as CardDeckEntity).count > 0) {
        const cardEntity = (this.entity as CardDeckEntity).drawCard();
        cardEntity.makeFaceUp();
        this.engineState.dealtStack.addEntity(cardEntity);
        this.engineState.engine.doTick();
      }
      else {
        while (this.engineState.dealtStack.count > 0) {
          let card = this.engineState.dealtStack.drawCard();
          card.makeFaceDown();
          this.engineState.deck.addCard(card);
        }
        this.engineState.engine.doTick();
      }
    }
  }

  @HostListener('mouseup')
  onMouseUp() {
    if (!(this.entity as CardDeckEntity).canDraw) {
      if (this.engineState.isHolding()) {
        this.engineState.drop(this.entity as CardDeckEntity);
      }
      else if (this.count > 0) {
        const card = (this.entity as CardDeckEntity).drawCard();
        this.engineState.pickUp(card);
      }
    }
  }
}
