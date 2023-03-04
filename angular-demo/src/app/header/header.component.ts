import { Component, HostListener } from '@angular/core';
import { EngineStateService } from '../engine-state.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less']
})
export class HeaderComponent {

  options: {name: string, type: string, value: any, callback: (val: any) => void}[] = [];

  openMenu = '';

  constructor(private engineState: EngineStateService) {

  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
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
    }
    else if ((event.target as HTMLElement).innerText == 'Options') {
      this.options = this.engineState.rules?.options || [];
    }
    else if ((event.target as HTMLElement).innerText.indexOf('Auto') > -1) {
      this.openMenu = '';
      this.engineState.autoPlay();
      if ((event.target as HTMLElement).innerText.indexOf('On') > -1) {
        (event.target as HTMLElement).innerText = 'Auto:Off'
      }
      else {
        (event.target as HTMLElement).innerText = 'Auto:On'
      }
    }
    event.stopPropagation();
  }
}
