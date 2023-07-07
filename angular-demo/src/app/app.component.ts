import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, NgZone, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { EngineStateService } from './engine-state.service';
import { AngularView, GameView } from 'game-engine-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements AfterViewInit {
  info: string = '';
  view!: AngularView;
  game: string = 'Klondike';
  width: number = 0;
  height: number = 0;

  @ViewChild('gameView')
  gameView!: GameView;

  constructor(protected engineState: EngineStateService, ref: ElementRef, private ngZone: NgZone, private cdr: ChangeDetectorRef) {
    this.engineState.game$().subscribe(game => {
      this.ngZone.run(() => {
        this.game = game;
        setTimeout(() => {
          this.initGame();
        }, 1);
      })
    })
  }

  ngAfterViewInit(): void {
    this.width = window.visualViewport?.width || 0;
    this.height = window.visualViewport?.height || 0;
    this.view = new AngularView(this.gameView, this.ngZone, this.cdr);
    this.initGame();
  }

  initGame() {
    this.view.setViewContainerRef(this.gameView.vcrs);
    this.engineState.init(this.view);
  }
}
