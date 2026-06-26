import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';


@Component({
  selector: 'app-comment-text-cell',
  standalone: true,
  template: `
    <div class="wrap">
      <div class="q">{{ text }}</div>
      @if (reply) {
        <div class="r">↳ {{ reply }}</div>
      }
    </div>
  `,
  styles: [`
    .wrap { line-height: 1.4; padding: 4px 0; }
    .q { font-size: 0.875rem; }
    .r { font-size: 0.875rem; color: #1976d2; margin-top: 4px; }
  `]
})
export class CommentTextCellRenderer implements ICellRendererAngularComp {
  text = '';
  reply: string | null = null;

  agInit(params: ICellRendererParams & { getReply?: (row: any) => string | null }): void {
    this.refresh(params);
  }

  refresh(params: any): boolean {
    this.text = params.value ?? '';
    this.reply = params.getReply ? params.getReply(params.data) : null;
    return true;
  }
}
