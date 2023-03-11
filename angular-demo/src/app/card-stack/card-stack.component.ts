import { Component, ElementRef, HostListener, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { CardStackEntity } from 'src/entities/card-stack-entity';
import { GameView } from 'src/utils/game-view';
import { EngineStateService } from '../engine-state.service';

@Component({
  selector: 'app-card-stack',
  templateUrl: './card-stack.component.html',
  styleUrls: ['./card-stack.component.less']
})
export class CardStackComponent extends GameView implements OnInit {
  count: number = 0;
  width: string = '10px';
  height: string = '10px';

  constructor(eref: ElementRef, private engineState: EngineStateService) {
    super(eref);
  }

  ngOnInit() {
    this.width = this.entityAs<CardStackEntity>().cardWidth;
    this.height = this.entityAs<CardStackEntity>().cardHeight;
  }

  override ngAfterViewInit(): void {
    super.ngAfterViewInit();
    let i = 0;
    for (let i = 0; i < this.children.length; i++) {
      (this.children[i] as any).style = `position: absolute; top: calc(${this.height} * ${i} / 10)`;
    }
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(evt: MouseEvent) {
    if (this.engineState.isHolding()) {
      this.engineState.drop(this.entityAs<CardStackEntity>());
    }
    else if (this.entityAs<CardStackEntity>().hasCards()) {
      let srcCard = evt.target as HTMLElement;
      while (srcCard.tagName != 'APP-CARD') {
        srcCard = srcCard.parentElement!;
      }
      const index = this.children.findIndex(child => child.nativeElement == srcCard);
      this.engineState.pickUpStack(this.entityAs<CardStackEntity>(),this.entityAs<CardStackEntity>().count() - index);
    }
  }
}
