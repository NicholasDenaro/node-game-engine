import { Component, ElementRef, HostListener, NgZone, OnInit } from '@angular/core';
import { EngineStateService } from 'src/app/engine-state.service';
import { SpiderRules } from 'src/entities/rules/spider-state';
import { sizeCards } from 'src/utils/card-sizer';
import { GameView } from 'src/utils/game-view';

@Component({
  selector: 'app-spider',
  templateUrl: './spider.component.html',
  styleUrls: ['./spider.component.less']
})
export class SpiderComponent extends GameView implements OnInit {

  mx: number = 0;
  my: number = 0;

  rows: string = '1fr';
  columns: string = '1fr';

  constructor(eref: ElementRef, engineState: EngineStateService) {
    super(eref);
    engineState.reset$().subscribe(() => {
      this.resize();
    })
  }

  ngOnInit() {
    this.resize();
  }

  resize() {
    const rules = new SpiderRules();
    const size = sizeCards(rules);
    this.rows = `calc(${size.height} / 2 + 10px) 1fr`;
    this.columns = `repeat(${rules.cardColumns * 2}, calc(${size.width} / 2 + 5px)) 1fr`;
  }

  @HostListener('mousemove', ['$event'])
  onMouse(event: MouseEvent) {
    this.mx = event.clientX - window.innerHeight / 10;
    this.my = event.clientY + window.innerHeight / 30;
  }
}
