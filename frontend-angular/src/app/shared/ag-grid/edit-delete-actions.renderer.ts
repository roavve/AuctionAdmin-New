import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-edit-delete-actions-cell',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    <div class="acts">
      <button mat-button color="primary" class="b" (click)="edit()">Edit</button>
      <button mat-button color="warn" class="b" (click)="del()">Delete</button>
    </div>
  `,
  styles: [`
    .acts { display: flex; gap: 4px; }
    .b { min-width: 0; padding: 0 8px; line-height: 30px; font-size: 0.8125rem; }
  `]
})
export class EditDeleteActionsCellRenderer implements ICellRendererAngularComp {
  private params!: ICellRendererParams & {
    onEdit?: (row: any) => void;
    onDelete?: (row: any) => void;
  };

  agInit(params: any): void { this.params = params; }
  refresh(params: any): boolean { this.params = params; return true; }
  edit(): void { this.params.onEdit?.(this.params.data); }
  del(): void { this.params.onDelete?.(this.params.data); }
}
