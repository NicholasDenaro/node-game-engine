import { Component, OnInit } from '@angular/core';
import { CardStackEntity } from 'src/entities/card-stack-entity';
import { AngularEntity } from 'src/utils/angular-entity';
import { GameView } from 'src/utils/view-ref-';

@Component({
  selector: 'app-card-stack',
  templateUrl: './card-stack.component.html',
  styleUrls: ['./card-stack.component.less']
})
export class CardStackComponent extends GameView implements OnInit {
  count: number = 0;

  ngOnInit(): void {
  }
}
