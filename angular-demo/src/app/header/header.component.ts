import { ChangeDetectorRef, Component, ElementRef, HostListener, NgZone, ViewChild } from '@angular/core';
import { EngineStateService } from '../engine-state.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less']
})
export class HeaderComponent {

  @ViewChild('auto')
  auto!: ElementRef;

  options: { name: string, type: string, value: any, callback: (val: any) => void }[] = [];

  gameOptions: { name: string, type: string, value: any, callback: (val: any) => void }[] = [
    {
      name: 'Klondike',
      type: 'button',
      value: 'Play',
      callback: async (val) => {
        this.engineState.setGame(val.srcElement?.value as string || '');
        this.engineState.reset();
        await this.engineState.engine.doTick();
        this.engineState.engine.resetStates();
        this.options = [];
        this.openMenu = '';
      },
    },
    {
      name: 'Spider',
      type: 'button',
      value: 'Play',
      callback: async (val) => {
        this.engineState.setGame(val.srcElement?.value as string || '');
        this.engineState.reset();
        await this.engineState.engine.doTick();
        this.engineState.engine.resetStates();
        this.options = [];
        this.openMenu = '';
      },
    },
  ];

  openMenu = '';

  private autoTurnedOffAutomatically = false;

  constructor(private engineState: EngineStateService, private ngZone: NgZone, private cdr: ChangeDetectorRef) {

  }

  @HostListener('click', ['$event'])
  async onClick(event: MouseEvent) {
    if ((event.target as HTMLElement).className.indexOf('button') == -1) {
      if ((event.target as HTMLElement).tagName.indexOf('INPUT') == -1 && (event.target as HTMLElement).className.indexOf('option')) {
        this.openMenu = '';
        this.options = [];
      }
      return;
    }

    this.options = [];

    if (this.openMenu == (event.target as HTMLElement).innerText) {
      this.openMenu = '';
      return;
    }

    this.openMenu = '';

    this.openMenu = (event.target as HTMLElement).innerText;
    if ((event.target as HTMLElement).innerText == 'Games') {
      this.options = this.gameOptions;
    }
    else if ((event.target as HTMLElement).innerText == 'Reset') {
      this.openMenu = '';
      this.engineState.reset();
      await this.engineState.engine.doTick();
      this.engineState.engine.resetStates();
    }
    else if ((event.target as HTMLElement).innerText == 'Options') {
      this.options = this.engineState.rules?.options || [];
    }
    else if ((event.target as HTMLElement).innerText == 'Undo') {
      this.openMenu = '';
      if (this.auto.nativeElement.innerText.indexOf('On') > -1) {
        this.auto.nativeElement.innerText = 'Auto:Off';
        this.engineState.autoPlay();
        this.autoTurnedOffAutomatically = true;
      }
      this.engineState.undo();
    }
    else if ((event.target as HTMLElement).innerText == 'Redo') {
      this.openMenu = '';
      if (this.auto.nativeElement.innerText.indexOf('On') > -1) {
        this.auto.nativeElement.innerText = 'Auto:Off';
        this.engineState.autoPlay();
        this.autoTurnedOffAutomatically = true;
      }
      this.engineState.redo();
      if (!this.engineState.hasMoreRedo() && this.autoTurnedOffAutomatically) {
        this.autoTurnedOffAutomatically = false;
        this.auto.nativeElement.innerText = 'Auto:On';
        this.engineState.autoPlay();
      }
    }
    else if ((event.target as HTMLElement).innerText.indexOf('Auto') > -1) {
      this.openMenu = '';
      this.engineState.autoPlay();
      if ((event.target as HTMLElement).innerText.indexOf('On') > -1) {
        (event.target as HTMLElement).innerText = 'Auto:Off';
      }
      else {
        (event.target as HTMLElement).innerText = 'Auto:On';
      }
      this.autoTurnedOffAutomatically = false;
    }
    event.stopPropagation();
  }
}
