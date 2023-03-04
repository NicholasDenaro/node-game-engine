import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { CardDeckEntity } from 'src/entities/card-deck-entity';
import { GameView } from 'src/utils/game-view';
import { EngineStateService } from '../engine-state.service';

@Component({
  selector: 'app-card-deck',
  templateUrl: './card-deck.component.html',
  styleUrls: ['./card-deck.component.less']
})
export class CardDeckComponent extends GameView implements OnInit {
  count: number = 0;
  revealTop: boolean = false;

  constructor(eref: ElementRef, private engineState: EngineStateService) {
    super(eref);
  }

  ngOnInit(): void {
    this.count = this.entityAs<CardDeckEntity>().count();
    this.revealTop = this.entityAs<CardDeckEntity>().revealTop;
  }

  @HostListener('mouseup')
  onClick() {
    if (!this.engineState.isHolding() && this.entityAs<CardDeckEntity>().canDraw) {
      if (this.entityAs<CardDeckEntity>().count() > 0) {
        this.engineState.deal(this.entityAs<CardDeckEntity>());
      }
      else {
        this.engineState.cycleDeck(this.entityAs<CardDeckEntity>());
      }
    }

    if (!this.entityAs<CardDeckEntity>().canDraw) {
      if (this.engineState.isHolding()) {
        this.engineState.drop(this.entityAs<CardDeckEntity>());
      }
      else if (this.count > 0) {
        this.engineState.pickUp(this.entityAs<CardDeckEntity>());
      }
    }
  }
}
