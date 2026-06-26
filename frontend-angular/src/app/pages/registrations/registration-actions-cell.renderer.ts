
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-registration-actions-cell',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    <div class="acts">
      <button mat-button color="primary" class="b" (click)="view()">View</button>
      @if (isNew) {
        <button mat-button class="b success" (click)="approve()">Approve</button>
        <button mat-button color="warn" class="b" (click)="reject()">Reject</button>
      }
    </div>
  `,
  styles: [`
    .acts { display: flex; gap: 4px; }
    .b { min-width: 0; padding: 0 8px; line-height: 30px; font-size: 0.8125rem; }
    .success { color: #2e7d32; }
  `]
})
export class RegistrationActionsCellRenderer implements ICellRendererAngularComp {
  isNew = false;
  private params!: ICellRendererParams & {
    isNew?: () => boolean;
    onView?: (row: any) => void;
    onApprove?: (row: any) => void;
    onReject?: (row: any) => void;
  };

  agInit(params: any): void {
    this.refresh(params);
  }

  refresh(params: any): boolean {
    this.params = params;
    this.isNew = params.isNew ? params.isNew() : false;
    return true;
  }

  view(): void { this.params.onView?.(this.params.data); }
  approve(): void { this.params.onApprove?.(this.params.data); }
  reject(): void { this.params.onReject?.(this.params.data); }
}
