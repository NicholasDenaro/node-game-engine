import { AfterViewInit, Component, ElementRef, TemplateRef, ViewChildren, ViewContainerRef } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { ViewDirective } from "src/app/view.directive";
import { AngularEntity } from "./angular-entity";

@Component({
  template: ''
})
export abstract class GameView implements AfterViewInit {
  private subject = new Subject<any>();
  private entity!: AngularEntity;
  readonly vcrs: {view: GameView, refs: {[key: string]: ViewContainerRef}} = {view: this, refs: {}};
  readonly children: GameView[] = [];
  nativeElement!: HTMLElement;

  constructor(eref: ElementRef) {
    this.nativeElement = eref.nativeElement;
  }

  @ViewChildren(TemplateRef, {read: ViewDirective})
  protected vcrChildren!: ViewDirective[];

  hook(): Observable<any> {
    return this.subject.asObservable();
  }

  ngAfterViewInit(): void {
    this.vcrs.refs = {};
    this.vcrChildren.forEach(vcr => {
      this.vcrs.refs[vcr.view] = vcr.vcr;
    });

    this.doHook(this.nativeElement);
  }

  doHook(nativeElement: HTMLElement) {
    this.nativeElement = nativeElement;
    this.subject.next({});
  }


  protected entityAs<T>() {
    return this.entity as T;
  }

  init(entity: AngularEntity) {
    this.entity = entity;
  }
}

