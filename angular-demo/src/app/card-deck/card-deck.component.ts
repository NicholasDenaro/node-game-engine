import { AfterViewInit, Component, HostListener, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { CardDeckEntity } from 'src/entities/card-deck-entity';
import { GameView } from 'src/utils/view-ref-';
import { EngineStateService } from '../engine-state.service';
import {Subject, Observable} from 'rxjs';

@Component({
  selector: 'app-card-deck',
  templateUrl: './card-deck.component.html',
  styleUrls: ['./card-deck.component.less']
})
export class CardDeckComponent extends GameView implements OnInit, AfterViewInit {
  private subject = new Subject<any>();
  count: number = 0;
  revealTop: boolean = false;

  @ViewChild('topCard', {read: ViewContainerRef})
  vcr!: ViewContainerRef;

  constructor(private engineState: EngineStateService) {
    super();
  }

  ngAfterViewInit() {
    this.vcrs['cards'] = this.vcr;
    this.subject.next({});
  }

  override hook(): Observable<any> {
    return this.subject.asObservable();
  }

  ngOnInit(): void {
    this.count = (this.entity as CardDeckEntity).count;
    this.revealTop = (this.entity as CardDeckEntity).revealTop;
  }

  @HostListener('click')
  onClick() {
    if ((this.entity as CardDeckEntity).canDraw) {
      const cardEntity = (this.entity as CardDeckEntity).drawCard();
      this.engineState.dealtStack.addEntity(cardEntity);
      this.engineState.engine.doTick();
    }
  }
}
