import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { ChatInnerComponent } from './chat-inner.component';
import { FormsModule } from '@angular/forms';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@NgModule({
  declarations: [ChatInnerComponent],
  imports: [CommonModule, InlineSVGModule, FormsModule, ChipModule, TooltipModule, ConfirmDialogModule],
  exports: [ChatInnerComponent],
})
export class ChatInnerModule {}
