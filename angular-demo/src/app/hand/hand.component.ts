import { AfterViewInit, Component, ViewChild, ViewContainerRef } from '@angular/core';
import { GameView as GameView } from 'src/utils/view-ref-';
import { Subject, Observable} from "rxjs";

@Component({
  selector: 'app-hand',
  templateUrl: './hand.component.html',
  styleUrls: ['./hand.component.less']
})
export class HandComponent extends GameView implements AfterViewInit {

  private subject = new Subject<any>();
  @ViewChild('viewContainerRef', { read: ViewContainerRef })
  vcr!: ViewContainerRef;

  ngAfterViewInit(): void {
    this.vcrs['cards'] = this.vcr;
    this.subject.next({});
  }

  override hook(): Observable<any> {
    return this.subject.asObservable();
  }
}
