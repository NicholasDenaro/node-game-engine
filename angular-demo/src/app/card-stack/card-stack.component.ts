import { Component, ElementRef, HostListener, ViewChild, ViewContainerRef } from '@angular/core';
import { CardStackEntity } from 'src/entities/card-stack-entity';
import { GameView } from 'src/utils/game-view';
import { EngineStateService } from '../engine-state.service';

@Component({
  selector: 'app-card-stack',
  templateUrl: './card-stack.component.html',
  styleUrls: ['./card-stack.component.less']
})
export class CardStackComponent extends GameView {
  count: number = 0;

  constructor(eref: ElementRef, private engineState: EngineStateService) {
    super(eref);
  }

  override ngAfterViewInit(): void {
    super.ngAfterViewInit();
    let i = 0;
    for (let i = 0; i < this.children.length; i++) {
      (this.children[i] as any).style = `position: absolute; top: ${i * 3.5}vh`;
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
      this.engineState.pickUpStack(this.entityAs<CardStackEntity>(),this.entityAs<CardStackEntity>().count - index);
    }
  }
}
