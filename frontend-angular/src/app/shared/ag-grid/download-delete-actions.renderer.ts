import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-download-delete-actions-cell',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    <div class="acts">
      <button mat-button color="primary" class="b" (click)="download()">Download</button>
      <button mat-button color="warn" class="b" (click)="del()">Delete</button>
    </div>
  `,
  styles: [`
    .acts { display: flex; gap: 4px; }
    .b { min-width: 0; padding: 0 8px; line-height: 30px; font-size: 0.8125rem; }
  `]
})
export class DownloadDeleteActionsCellRenderer implements ICellRendererAngularComp {
  private params!: ICellRendererParams & {
    onDownload?: (row: any) => void;
    onDelete?: (row: any) => void;
  };

  agInit(params: any): void { this.params = params; }
  refresh(params: any): boolean { this.params = params; return true; }
  download(): void { this.params.onDownload?.(this.params.data); }
  del(): void { this.params.onDelete?.(this.params.data); }
}
