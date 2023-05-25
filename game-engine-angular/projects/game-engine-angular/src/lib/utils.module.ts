import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewDirective } from './view.directive';



@NgModule({
  declarations: [
    ViewDirective
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    ViewDirective
  ]
})
export class UtilsModule { }
