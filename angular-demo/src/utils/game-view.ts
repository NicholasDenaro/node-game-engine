import { AfterViewInit, Component, ViewContainerRef } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { AngularEntity } from "./angular-entity";

@Component({
  template: ''
})
export abstract class GameView implements AfterViewInit {
  vcrs: {view: GameView, refs: {[key: string]: ViewContainerRef}} = {view: this, refs: {}};
  private subject = new Subject<any>();
  children: GameView[] = [];
  nativeElement!: HTMLElement;

  hook(): Observable<any> {
    return this.subject.asObservable();
  }

  abstract ngAfterViewInit(): void;

  doHook(nativeElement: HTMLElement) {
    this.nativeElement = nativeElement;
    this.subject.next({});
  }

  protected entity!: AngularEntity;

  init(entity: AngularEntity) {
    this.entity = entity;
  }
}

