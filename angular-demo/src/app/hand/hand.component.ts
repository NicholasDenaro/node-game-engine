import { AfterViewInit, Component, ElementRef, ViewChild, ViewContainerRef } from '@angular/core';
import { GameView as GameView } from 'src/utils/game-view';
import { Subject, Observable} from "rxjs";

@Component({
  selector: 'app-hand',
  templateUrl: './hand.component.html',
  styleUrls: ['./hand.component.less']
})
export class HandComponent extends GameView implements AfterViewInit {

  @ViewChild('viewContainerRef', { read: ViewContainerRef })
  vcr!: ViewContainerRef;

  constructor(private eref: ElementRef) {
    super();
  }

  ngAfterViewInit(): void {
    this.vcrs.refs['cards'] = this.vcr;
    this.doHook(this.eref.nativeElement);
  }
}
