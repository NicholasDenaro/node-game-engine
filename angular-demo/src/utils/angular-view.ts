import { ChangeDetectorRef, NgZone, Type, ViewContainerRef } from "@angular/core";
import { Entity, View } from "game-engine";
import { AppComponent } from "src/app/app.component";
import { CardComponent } from "src/app/card/card.component";
import { AngularEntity } from "./angular-entity";

export class AngularView implements View {
    private vcrs!: {[key: string]: ViewContainerRef};

    constructor(private app: AppComponent, private ngZone: NgZone, private cdr: ChangeDetectorRef) {

    }

    debugInfo(info: any): void {
        this.ngZone.run(() => {
            this.app.info = info;
        });
    }

    setViewContainerRef(vcrs: {[key: string]: ViewContainerRef}) {
        this.vcrs = vcrs;
    }

    draw(entities: Entity[]): Promise<void> {
        return new Promise((resolve, reject) => {
            this.ngZone.run(() => {
                const keys = Object.keys(this.vcrs);
                for (let i = 0; i < keys.length; i++) {
                    this.vcrs[keys[i]].clear();
                    
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