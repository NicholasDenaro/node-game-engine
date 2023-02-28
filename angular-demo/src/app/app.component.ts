import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, ViewChild, ViewContainerRef } from '@angular/core';
import { Scene} from 'game-engine';
import { AngularEntity } from 'src/utils/angular-entity';
import { AngularView } from 'src/utils/angular-view';
import { CardEntity } from 'src/entities/card-entity';
import { ObserverEngine } from 'src/utils/observer-engine';
import { HandComponent } from './hand/hand.component';
import { CardDeckEntity } from 'src/entities/card-deck-entity';
import { EngineStateService } from './engine-state.service';
import { GameView } from 'src/utils/view-ref-';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent extends GameView implements AfterViewInit {
  nativeElement: HTMLElement;
  info: string = '';
  view: AngularView;

  @ViewChild('viewContainerRef', { read: ViewContainerRef })
  vcr!: ViewContainerRef;

  @ViewChild('deck', { read: ViewContainerRef })
  deck!: ViewContainerRef;

  @ViewChild('hand', { read: ViewContainerRef })
  hand!: ViewContainerRef;

  constructor(private engineState: EngineStateService, ref: ElementRef, ngZone: NgZone, cdr: ChangeDetectorRef) {
    super();
    this.nativeElement = ref.nativeElement;
    this.view = new AngularView(this, ngZone, cdr)
  }

  ngAfterViewInit(): void {
    this.vcrs['hand'] = this.hand;
    this.vcrs['deck'] = this.deck;
    this.view.setViewContainerRef(this.vcrs);

    this.engineState.init(this.view);
  }
}
