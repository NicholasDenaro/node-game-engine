import { Component, ElementRef, HostBinding, HostListener, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { CardEntity } from 'src/entities/card-entity';
import { GameView } from 'src/utils/game-view';
import { EngineStateService } from '../engine-state.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.less']
})
export class CardComponent extends GameView implements OnInit  {
  suit: string | undefined = undefined;
  value: string | undefined = undefined;
  suitColor: string = 'black';
  isUp: boolean = true;
  @HostBinding()
  style: string ='';

  constructor(private eref: ElementRef, private engineState: EngineStateService) {
    super();
  }

  ngAfterViewInit(): void {
    this.eref.nativeElement.style = this.style;
    this.doHook(this.eref.nativeElement);
  }

  ngOnInit(): void {
    this.suit = (this.entity as CardEntity).suit;
    this.value = (this.entity as CardEntity).value;
    this.isUp = (this.entity as CardEntity).isUp;
    switch (this.value) {
      case '11':
        this.value = 'J';
        break;
      case '12':
        this.value = 'Q';
        break;
      case '13':
        this.value = 'K';
        break;
    }
    switch(this.suit) {
      case '♥':
      case '♦':
        this.suitColor = 'red';
    }
  }
}
