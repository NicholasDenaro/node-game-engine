import { Component, ElementRef } from '@angular/core';
import { GameView as GameView } from 'game-engine-angular';

@Component({
  selector: 'app-hand',
  templateUrl: './hand.component.html',
  styleUrls: ['./hand.component.less']
})
export class HandComponent extends GameView {

  constructor(eref: ElementRef) {
    super(eref);
  }
}
