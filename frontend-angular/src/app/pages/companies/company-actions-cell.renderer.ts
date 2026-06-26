import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-company-actions-cell',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    <div class="acts">
      <button mat-button color="primary" class="b" (click)="view()">View</button>
      @if (isCreated) {
        <button mat-button color="primary" class="b" (click)="invite()">Invite</button>
      }
    </div>
  `,
  styles: [`
    .acts { display: flex; gap: 4px; }
    .b { min-width: 0; padding: 0 8px; line-height: 30px; font-size: 0.8125rem; }
  `]
})
export class CompanyActionsCellRenderer implements ICellRendererAngularComp {
  isCreated = false;
  private params!: ICellRendererParams & {
    onView?: (row: any) => void;
    onInvite?: (row: any) => void;
  };

  agInit(params: any): void {
    this.refresh(params);
  }

  refresh(params: any): boolean {
    this.params = params;
    this.isCreated = params.data?.status?.key === 'key.companyStatus.created';
    return true;
  }

  view(): void { this.params.onView?.(this.params.data); }
  invite(): void { this.params.onInvite?.(this.params.data); }
}
