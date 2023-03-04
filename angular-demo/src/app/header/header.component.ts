import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { EngineStateService } from '../engine-state.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less']
})
export class HeaderComponent {

  @ViewChild('auto')
  auto!: ElementRef;

  options: {name: string, type: string, value: any, callback: (val: any) => void}[] = [];

  openMenu = '';

  private autoTurnedOffAutomatically = false;

  constructor(private engineState: EngineStateService) {

  }

  @HostListener('click', ['$event'])
  async onClick(event: MouseEvent) {
    if ((event.target as HTMLElement).className.indexOf('button') == -1) {
      return;
    }

    if (this.openMenu == (event.target as HTMLElement).innerText) {
      this.options = [];
      this.openMenu = '';
      return;
    }

    this.openMenu = (event.target as HTMLElement).innerText;
    if ((event.target as HTMLElement).innerText == 'Reset') {
      this.openMenu = '';
      this.engineState.reset();
      await this.engineState.engine.doTick();
      this.engineState.engine.resetStates();
    }
    else if ((event.target as HTMLElement).innerText == 'Options') {
      this.options = this.engineState.rules?.options || [];
    }
    else if ((event.target as HTMLElement).innerText == 'Undo') {
      if (this.auto.nativeElement.innerText.indexOf('On') > -1) {
        this.auto.nativeElement.innerText = 'Auto:Off';
        this.engineState.autoPlay();
        this.autoTurnedOffAutomatically = true;
      }
      this.openMenu = '';
      this.engineState.undo();
    }
    else if ((event.target as HTMLElement).innerText == 'Redo') {
      if (this.auto.nativeElement.innerText.indexOf('On') > -1) {
        this.auto.nativeElement.innerText = 'Auto:Off';
        this.engineState.autoPlay();
        this.autoTurnedOffAutomatically = true;
      }
      this.openMenu = '';
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
