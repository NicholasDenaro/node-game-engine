import { ChangeDetectorRef, Component, ElementRef, HostListener, NgZone } from '@angular/core';
import { AngularView } from 'src/utils/angular-view';
import { EngineStateService } from './engine-state.service';
import { GameView } from 'src/utils/game-view';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent extends GameView {
  info: string = '';
  view: AngularView;
  mx: number = 0;
  my: number = 0;

  constructor(private engineState: EngineStateService, ref: ElementRef, ngZone: NgZone, cdr: ChangeDetectorRef) {
    super(ref);
    this.view = new AngularView(this, ngZone, cdr);
  }

  override ngAfterViewInit(): void {
    super.ngAfterViewInit();

    this.view.setViewContainerRef(this.vcrs);
    this.engineState.init(this.view);
  }

  @HostListener('mousemove', ['$event'])
  onMouse(event: MouseEvent) {
    this.mx = event.clientX - window.innerHeight / 10;
    this.my = event.clientY + window.innerHeight / 30;
  }
}
