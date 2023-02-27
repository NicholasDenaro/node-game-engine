import { Component } from '@angular/core';
import {FixedTickEngine} from 'game-engine';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  constructor() {
    new FixedTickEngine(60).start();
  }
}
