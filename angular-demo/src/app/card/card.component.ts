import { Component, ElementRef, HostBinding, OnInit } from '@angular/core';
import { CardEntity } from 'src/entities/card-entity';
import { GameView } from 'game-engine-angular';
import { EngineStateService } from '../engine-state.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.less']
})
export class CardComponent extends GameView implements OnInit {
  suit: string = '';
  value: string = '';
  suitColor: string = 'black';
  isUp: boolean = true;
  @HostBinding()
  style: string = '';

  width: string = '10px';
  height: string = '10px';

  constructor(private eref: ElementRef, private engineState: EngineStateService) {
    super(eref);
  }

  override ngAfterViewInit(): void {
    this.eref.nativeElement.style = this.style;
    super.ngAfterViewInit();
  }

  ngOnInit(): void {
    this.suit = this.entityAs<CardEntity>().suit;
    this.value = this.entityAs<CardEntity>().value;
    this.isUp = this.entityAs<CardEntity>().isUp;
    this.width = this.entityAs<CardEntity>().width;
    this.height = this.entityAs<CardEntity>().height;
    switch (this.entityAs<CardEntity>().value) {
      case '1':
        this.value = 'A';
        break;
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
    switch (this.entityAs<CardEntity>().suit) {
      case '♥':
      case '♦':
        this.suitColor = 'red';
    }
  }
}
