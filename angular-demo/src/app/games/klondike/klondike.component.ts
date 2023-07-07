import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { EngineStateService } from 'src/app/engine-state.service';
import { SolitaireRules } from 'src/entities/rules/solitaire-state';
import { sizeCards } from 'src/utils/card-sizer';
import { GameView } from 'game-engine-angular';

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

  constructor(eref: ElementRef, engineState: EngineStateService) {
    super(eref);
    engineState.reset$().subscribe(() => {
      this.resize();
    })
    engineState.resize$().subscribe(() => {
      this.resize();
    })
  }

  ngOnInit() {
    this.resize();
  }

  resize() {
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
