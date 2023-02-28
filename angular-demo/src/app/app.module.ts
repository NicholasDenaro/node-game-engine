import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { CardComponent } from './card/card.component';
import { HandComponent } from './hand/hand.component';
import { CardStackComponent } from './card-stack/card-stack.component';
import { CardDeckComponent } from './card-deck/card-deck.component';

@NgModule({
  declarations: [
    AppComponent,
    CardComponent,
    HandComponent,
    CardStackComponent,
    CardDeckComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {
  }
}
