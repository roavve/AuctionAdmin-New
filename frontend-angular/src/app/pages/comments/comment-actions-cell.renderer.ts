import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';


@Component({
  selector: 'app-comment-actions-cell',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    @if (!isAdmin) {
      <div class="acts">
        @if (isNew) {
          <button mat-button class="b success" (click)="approve()">Approve</button>
          <button mat-button color="primary" class="b" (click)="answer()">Answer</button>
        }
        <button mat-button color="warn" class="b" (click)="cancel()">Cancel</button>
      </div>
    }
  `,
  styles: [`
    .acts { display: flex; gap: 4px; }
    .b { min-width: 0; padding: 0 8px; line-height: 30px; font-size: 0.8125rem; }
    .success { color: #2e7d32; }
  `]
})
export class CommentActionsCellRenderer implements ICellRendererAngularComp {
  isAdmin = false;
  isNew = false;
  private params!: ICellRendererParams & {
    onApprove?: (row: any) => void;
    onAnswer?: (row: any) => void;
    onCancel?: (row: any) => void;
  };

  agInit(params: any): void {
    this.refresh(params);
  }

  refresh(params: any): boolean {
    this.params = params;
    this.isAdmin = !!params.data?.admin;
    this.isNew = params.data?.status?.key === 'key.coment.new';
    return true;
  }

  approve(): void { this.params.onApprove?.(this.params.data); }
  answer(): void { this.params.onAnswer?.(this.params.data); }
  cancel(): void { this.params.onCancel?.(this.params.data); }
}
