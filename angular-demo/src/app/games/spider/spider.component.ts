import { Component, HostListener, OnInit } from '@angular/core';
import { SpiderRules } from 'src/entities/spider-state';
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

  ngOnInit() {
    const rules = new SpiderRules();
    const size = sizeCards(rules);
    this.rows = `calc(${size.height} / 2 + 10px) 1fr`;
    this.columns = `repeat(${rules.cardColumns}, calc(${size.width} + 10px)) 1fr`;
  }

  @HostListener('mousemove', ['$event'])
  onMouse(event: MouseEvent) {
    this.mx = event.clientX - window.innerHeight / 10;
    this.my = event.clientY + window.innerHeight / 30;
  }
}
