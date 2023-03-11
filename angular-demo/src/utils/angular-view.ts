import { ChangeDetectorRef, NgZone, Type, ViewContainerRef } from "@angular/core";
import { Entity, View } from "game-engine";
import { AngularEntity } from "./angular-entity";
import { GameView } from "./game-view";

export class AngularView implements View {
    private vcrs!: {view: GameView, refs: {[key: string]: ViewContainerRef}};

    constructor(private app: GameView, private ngZone: NgZone, private cdr: ChangeDetectorRef) {

    }

    debugInfo(info: any): void {
        this.ngZone.run(() => {
            //this.app.info = info;
        });
    }

    setViewContainerRef(vcrs: {view: GameView, refs: {[key: string]: ViewContainerRef}}) {
        this.vcrs = vcrs;
    }

    draw(entities: Entity[]): Promise<void> {
        return new Promise((resolve, reject) => {
            this.ngZone.run(() => {
                if (!this.vcrs) {
                    return;
                }
                const keys = Object.keys(this.vcrs.refs);
                for (let i = 0; i < keys.length; i++) {
                    this.vcrs.refs[keys[i]].clear();
                }
                entities.map(entity => entity as AngularEntity).filter(entity => entity).forEach(entity => {
                    entity.painter.paint(this.vcrs);
                });
                this.cdr.detectChanges();
                resolve();
            });
        });
        
    }

    viewElement(): HTMLElement {
        return this.app.nativeElement;
    }
}