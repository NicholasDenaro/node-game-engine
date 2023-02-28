import { ViewContainerRef } from "@angular/core";
import {Observable, of} from "rxjs";
import { AngularEntity } from "./angular-entity";

export abstract class GameView {
  vcrs: {[key: string]: ViewContainerRef} = {};

  hook(): Observable<any> {
    return of({});
  }

  protected entity!: AngularEntity;

  init(entity: AngularEntity) {
    this.entity = entity;
  }
}

