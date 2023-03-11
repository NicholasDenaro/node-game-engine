import { Component, HostListener, OnInit } from '@angular/core';
import { SolitaireRules } from 'src/entities/solitaire-state';
import { sizeCards } from 'src/utils/card-sizer';
import { GameView } from 'src/utils/game-view';

@Component({
  selector: 'app-klondike',
  templateUrl: './klondike.component.html',
  styleUrls: ['./klondike.component.less']
})
export class KlondikeComponent extends GameView implements OnInit {
  mx: number = 0;
  my: number = 0;

  rows: string = '1fr';
  columns: string = '1fr';

  ngOnInit() {
    const rules = new SolitaireRules();
    const size = sizeCards(rules);
    this.rows = `calc(${size.height} + 10px) 1fr`;
    this.columns = `repeat(${rules.cardColumns}, calc(${size.width} + 20px)) 1fr`;
  }


  @HostListener('mousemove', ['$event'])
  onMouse(event: MouseEvent) {
    this.mx = event.clientX - window.innerHeight / 10;
    this.my = event.clientY + window.innerHeight / 30;
  }
}
