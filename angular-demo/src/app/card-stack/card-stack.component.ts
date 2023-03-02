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

  @ViewChild('stack', {read: ViewContainerRef})
  stack!: ViewContainerRef;

  constructor(private eref: ElementRef, private engineState: EngineStateService) {
    super();
  }

  ngAfterViewInit(): void {
    this.vcrs.refs['cards'] = this.stack;
    this.doHook(this.eref.nativeElement);
    let i = 0;
    for (let i = 0; i < this.children.length; i++) {
      (this.children[i] as any).style = `position: absolute; top: ${i * 2}em`;
    }
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(evt: MouseEvent) {
    if (this.engineState.isHolding()) {
      this.engineState.drop(this.entity as CardStackEntity);
    }
    else if ((this.entity as CardStackEntity).hasCards()) {
      let srcCard = evt.target as HTMLElement;
      while (srcCard.tagName != 'APP-CARD') {
        srcCard = srcCard.parentElement!;
      }
      const index = this.children.findIndex(child => child.nativeElement == srcCard);
      this.pickCard((this.entity as CardStackEntity).count - index);
    }
  }

  private pickCard(pickupCount: number) {
    const cards = (this.entity as CardStackEntity).drawCards(pickupCount);
    if (cards[0].isUp) {
      this.engineState.pickUpStack(cards);
    }
    else {
      if (cards.length == 1) {
        cards[0].makeFaceUp();
        this.engineState.engine.doTick();
      }
      cards.forEach(card => {
        (this.entity as CardStackEntity).addCard(card);
      });
    }
  }
}
