import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, themeQuartz } from 'ag-grid-community';

import { AuctionService } from '../../services/auction.service';
import { DownloadDeleteActionsCellRenderer } from '../../shared/ag-grid/download-delete-actions.renderer';

const API = 'http://localhost:8080/api/auctions';

@Component({
  selector: 'app-auction-files-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="bar">
      <span class="title">{{ type === 'internal' ? 'Internal Files' : 'Revision Files' }}</span>
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="desc">
        <mat-label>Description (optional)</mat-label>
        <input matInput [(ngModel)]="fileDescription" />
      </mat-form-field>
      <button mat-raised-button color="primary" [disabled]="uploading()" (click)="fileInput.click()">
        {{ uploading() ? 'Uploading...' : 'Upload File' }}
      </button>
      <input #fileInput type="file" hidden (change)="onFileSelected($event)" />
    </div>
    <ag-grid-angular class="grid" [theme]="theme" [rowData]="rows()" [columnDefs]="columnDefs"
      [domLayout]="'autoHeight'" [loading]="loading()" [suppressCellFocus]="true"></ag-grid-angular>
  `,
  styles: [`
    .bar { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
    .title { font-weight: 700; }
    .desc { width: 250px; }
    .grid { width: 100%; }
  `]
})
export class AuctionFilesTabComponent implements OnInit {
  @Input() auctionId!: string;
  @Input() type: 'files' | 'internal' = 'files';

  rows = signal<any[]>([]);
  loading = signal(true);
  uploading = signal(false);
  fileDescription = '';
  theme = themeQuartz;

  columnDefs: ColDef[] = [];

  constructor(private auctionService: AuctionService) {}

  ngOnInit(): void {
    const seg = this.type === 'internal' ? 'internal-files' : 'files';
    this.columnDefs = [
      { field: 'id', headerName: 'ID', width: 70 },
      { field: 'fileName', headerName: 'File Name', flex: 1, minWidth: 150 },
      { field: 'fileDescription', headerName: 'Description', width: 200 },
      { field: 'fileSize', headerName: 'Size (bytes)', width: 120 },
      { field: 'fileDate', headerName: 'Date', width: 160, valueFormatter: p => (p.value ? new Date(p.value).toLocaleString() : '-') },
      { field: 'fileUser', headerName: 'Uploaded By', width: 150 },
      {
        field: 'actions', headerName: '', width: 160, sortable: false,
        cellRenderer: DownloadDeleteActionsCellRenderer,
        cellRendererParams: {
          onDownload: (row: any) => this.download(`${API}/${seg}/${row.id}/download`, row.fileName),
          onDelete: (row: any) => this.deleteFile(row.id),
        },
      },
    ];
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const obs = this.type === 'internal'
      ? this.auctionService.getInternalFiles(this.auctionId)
      : this.auctionService.getFiles(this.auctionId);
    obs.subscribe({ next: d => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploading.set(true);
    const fd = new FormData();
    fd.append('file', file);
    if (this.fileDescription) fd.append('description', this.fileDescription);
    const obs = this.type === 'internal'
      ? this.auctionService.uploadInternalFile(this.auctionId, fd)
      : this.auctionService.uploadFile(this.auctionId, fd);
    obs.subscribe({
      next: () => { this.load(); this.uploading.set(false); input.value = ''; },
      error: () => { this.uploading.set(false); input.value = ''; },
    });
  }

  deleteFile(fileId: number | string): void {
    const obs = this.type === 'internal'
      ? this.auctionService.deleteInternalFile(fileId)
      : this.auctionService.deleteFile(fileId);
    obs.subscribe({ next: () => this.load(), error: () => {} });
  }

  download(url: string, fileName: string): void {
    this.auctionService.download(url).subscribe({
      next: blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName || 'download';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(blobUrl);
      },
      error: () => {},
    });
  }
}
