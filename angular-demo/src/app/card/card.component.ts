import { Component, OnInit } from '@angular/core';
import { CardEntity } from 'src/entities/card-entity';
import { GameView } from 'src/utils/view-ref-';

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

  ngOnInit(): void {
    console.log('update card');
    this.suit = (this.entity as CardEntity).suit;
    this.value = (this.entity as CardEntity).value;
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
