import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, NgZone, TemplateRef, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { AngularView } from 'src/utils/angular-view';
import { EngineStateService } from './engine-state.service';
import { GameView } from 'src/utils/game-view';
import { of } from 'rxjs';

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

  @ViewChild('viewContainerRef', { read: ViewContainerRef })
  vcr!: ViewContainerRef;

  @ViewChild('deck', { read: ViewContainerRef })
  deck!: ViewContainerRef;

  @ViewChild('hand', { read: ViewContainerRef })
  hand!: ViewContainerRef;

  @ViewChild('dealt', { read: ViewContainerRef })
  dealt!: ViewContainerRef;

  @ViewChild('sort1', { read: ViewContainerRef })
  sort1!: ViewContainerRef;

  @ViewChild('sort2', { read: ViewContainerRef })
  sort2!: ViewContainerRef;

  @ViewChild('sort3', { read: ViewContainerRef })
  sort3!: ViewContainerRef;

  @ViewChild('sort4', { read: ViewContainerRef })
  sort4!: ViewContainerRef;

  @ViewChild('stack1', { read: ViewContainerRef })
  stack1!: ViewContainerRef;

  @ViewChild('stack2', { read: ViewContainerRef })
  stack2!: ViewContainerRef;

  @ViewChild('stack3', { read: ViewContainerRef })
  stack3!: ViewContainerRef;

  @ViewChild('stack4', { read: ViewContainerRef })
  stack4!: ViewContainerRef;

  @ViewChild('stack5', { read: ViewContainerRef })
  stack5!: ViewContainerRef;

  @ViewChild('stack6', { read: ViewContainerRef })
  stack6!: ViewContainerRef;

  @ViewChild('stack7', { read: ViewContainerRef })
  stack7!: ViewContainerRef;

  @ViewChildren(TemplateRef)
  vcrChildren!: ViewContainerRef[];

  constructor(private engineState: EngineStateService, ref: ElementRef, ngZone: NgZone, cdr: ChangeDetectorRef) {
    super();
    this.nativeElement = ref.nativeElement;
    this.view = new AngularView(this, ngZone, cdr)
  }

  ngAfterViewInit(): void {
    //console.log(this.vcrChildren);
    this.vcrs.refs['cards'] = this.hand;
    this.vcrs.refs['dealt'] = this.dealt;
    this.vcrs.refs['deck'] = this.deck;
    this.vcrs.refs['sort1'] = this.sort1;
    this.vcrs.refs['sort2'] = this.sort2;
    this.vcrs.refs['sort3'] = this.sort3;
    this.vcrs.refs['sort4'] = this.sort4;
    this.vcrs.refs['stack1'] = this.stack1;
    this.vcrs.refs['stack2'] = this.stack2;
    this.vcrs.refs['stack3'] = this.stack3;
    this.vcrs.refs['stack4'] = this.stack4;
    this.vcrs.refs['stack5'] = this.stack5;
    this.vcrs.refs['stack6'] = this.stack6;
    this.vcrs.refs['stack7'] = this.stack7;
    this.view.setViewContainerRef(this.vcrs);
    this.doHook(this.nativeElement);

    this.engineState.init(this.view);
  }

  @HostListener('mousemove', ['$event'])
  onMouse(event: MouseEvent) {
    this.mx = event.clientX - 60;
    this.my = event.clientY + 20;
    //console.log(`${this.mx}, ${this.my}`);
  }

  // @HostListener('click', ['$event'])
  // onClick(event: MouseEvent) {
  //   if (this.engineState.isHolding()) {

  //   }
  // }
}
