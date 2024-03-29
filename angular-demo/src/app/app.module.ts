import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { CardComponent } from './card/card.component';
import { HandComponent } from './hand/hand.component';
import { CardStackComponent } from './card-stack/card-stack.component';
import { CardDeckComponent } from './card-deck/card-deck.component';
import { UtilsModule } from 'game-engine-angular';
import { HeaderComponent } from './header/header.component';
import { KlondikeComponent } from './games/klondike/klondike.component';
import { SpiderComponent } from './games/spider/spider.component';
import { LobbyComponent } from './games/lobby/lobby.component';

@NgModule({
  declarations: [
    AppComponent,
    CardComponent,
    HandComponent,
    CardStackComponent,
    CardDeckComponent,
    HeaderComponent,
    KlondikeComponent,
    SpiderComponent,
    LobbyComponent
  ],
  imports: [
    BrowserModule,
    UtilsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {
  }
}
