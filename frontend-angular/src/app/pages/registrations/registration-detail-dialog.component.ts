import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, themeQuartz } from 'ag-grid-community';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

import { RegistrationService } from '../../services/registration.service';

@Component({
  selector: 'app-reg-file-actions-cell',
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
export class RegistrationFileActionsCellRenderer implements ICellRendererAngularComp {
  private params!: ICellRendererParams & {
    onDownload?: (row: any) => void;
    onDelete?: (row: any) => void;
  };

  agInit(params: any): void { this.params = params; }
  refresh(params: any): boolean { this.params = params; return true; }
  download(): void { this.params.onDownload?.(this.params.data); }
  del(): void { this.params.onDelete?.(this.params.data); }
}

const FILES_API = 'http://localhost:8080/api/registrations';

@Component({
  selector: 'app-registration-detail-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, AgGridAngular,
  ],
  template: `
    <h2 mat-dialog-title class="dlg-title">
      Registration: {{ reg().companyName }}
      <span class="subtitle">{{ reg().contactEmail }} | {{ reg().taxId }}</span>
    </h2>

    <mat-dialog-content class="dlg-content">
      <div class="section">
        <div class="section-title">Details</div>
        <div class="line">Contact: {{ reg().contactName }} {{ reg().contactSurname }}</div>
        <div class="line">Phone: {{ reg().contactPhone }}</div>
        <div class="line">Mobile: {{ reg().contactMobile }}</div>
        <div class="line">Address: {{ reg().phisAddress }}</div>
        <div class="line">Tax ID: {{ reg().taxId }}</div>
        <div class="line">VAT Payer: {{ reg().vatPayer ? 'Yes' : 'No' }}</div>

        <div class="policy-box" [class.ok]="reg().policyAccepted" [class.bad]="!reg().policyAccepted">
          {{ reg().policyAccepted ? '✓ Policy Accepted' : '✗ Policy Not Accepted' }}
        </div>

        @if (reg().policyFileName) {
          <div class="policy-doc">
            <div class="line">Policy Document: <strong>{{ reg().policyFileName }}</strong></div>
            <button mat-stroked-button (click)="downloadPolicy()">Download Policy Doc</button>
          </div>
        }
      </div>

      <div class="section-title">Files</div>
      <div class="upload-row">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="desc">
          <mat-label>Description (optional)</mat-label>
          <input matInput [(ngModel)]="fileDescription" />
        </mat-form-field>
        <button mat-raised-button color="primary" [disabled]="uploading()" (click)="fileInput.click()">
          {{ uploading() ? 'Uploading...' : 'Upload File' }}
        </button>
        <input #fileInput type="file" hidden (change)="onFileSelected($event)" />
      </div>

      @if (files().length === 0) {
        <p class="empty">No files attached</p>
      } @else {
        <ag-grid-angular
          class="grid"
          [theme]="theme"
          [rowData]="files()"
          [columnDefs]="fileColumns"
          [domLayout]="'autoHeight'"
          [suppressCellFocus]="true">
        </ag-grid-angular>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      @if (data.isNew) {
        @if (!reg().policyAccepted) {
          <button mat-stroked-button class="btn-warn-outline" (click)="acceptPolicy()">Mark Policy Accepted</button>
        }
        <button mat-raised-button class="btn-success" [disabled]="!reg().policyAccepted" (click)="approve()">Approve</button>
        <button mat-raised-button color="warn" (click)="reject()">Reject</button>
      }
      <button mat-button (click)="close()">Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dlg-title { display: flex; flex-direction: column; }
    .subtitle { font-size: 0.875rem; color: rgba(0,0,0,.6); font-weight: 400; }
    .dlg-content { border-top: 1px solid rgba(0,0,0,.12); border-bottom: 1px solid rgba(0,0,0,.12); }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 0.875rem; font-weight: 700; margin-bottom: 8px; }
    .line { font-size: 0.875rem; margin-bottom: 2px; }
    .policy-box { display: inline-block; margin-top: 8px; padding: 6px 12px; border-radius: 4px; color: #fff; font-size: 0.875rem; font-weight: 700; }
    .policy-box.ok { background: #4caf50; }
    .policy-box.bad { background: #ef5350; }
    .policy-doc { margin-top: 8px; }
    .policy-doc button { margin-top: 4px; }
    .upload-row { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
    .desc { width: 250px; }
    .empty { font-size: 0.875rem; color: rgba(0,0,0,.6); }
    .grid { width: 100%; }
    .btn-success { background: #2e7d32; color: #fff; }
    .btn-warn-outline { color: #ed6c02; border-color: rgba(237,108,2,.5); }
  `]
})
export class RegistrationDetailDialogComponent implements OnInit {
  reg = signal<any>(null);
  files = signal<any[]>([]);
  uploading = signal(false);
  fileDescription = '';

  theme = themeQuartz;

  fileColumns: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'fileName', headerName: 'File Name', flex: 1, minWidth: 150 },
    { field: 'fileDescription', headerName: 'Description', width: 200 },
    { field: 'fileSize', headerName: 'Size', width: 100 },
    {
      field: 'fileDate', headerName: 'Date', width: 160,
      valueFormatter: p => (p.value ? new Date(p.value).toLocaleString() : '-'),
    },
    {
      field: 'actions', headerName: '', width: 160, sortable: false,
      cellRenderer: RegistrationFileActionsCellRenderer,
      cellRendererParams: {
        onDownload: (row: any) => this.download(`${FILES_API}/files/${row.id}/download`, row.fileName),
        onDelete: (row: any) => this.handleDelete(row.id),
      },
    },
  ];

  constructor(
    public dialogRef: MatDialogRef<RegistrationDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { reg: any; isNew: boolean },
    private registrationService: RegistrationService,
  ) {
    this.reg.set({ ...data.reg });
  }

  ngOnInit(): void {
    this.loadFiles();
  }

  loadFiles(): void {
    this.registrationService.getFiles(this.reg().id).subscribe({
      next: f => this.files.set(f),
      error: () => this.files.set([]),
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploading.set(true);
    const formData = new FormData();
    formData.append('file', file);
    if (this.fileDescription) formData.append('description', this.fileDescription);
    this.registrationService.uploadFile(this.reg().id, formData).subscribe({
      next: () => { this.loadFiles(); this.uploading.set(false); input.value = ''; },
      error: () => { this.uploading.set(false); input.value = ''; },
    });
  }

  handleDelete(fileId: number | string): void {
    this.registrationService.deleteFile(fileId).subscribe({
      next: () => this.loadFiles(),
      error: () => {},
    });
  }

  download(url: string, fileName: string): void {
    this.registrationService.download(url).subscribe({
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

  downloadPolicy(): void {
    this.download(`${FILES_API}/${this.reg().id}/policy`, this.reg().policyFileName);
  }

  acceptPolicy(): void {
    this.registrationService.acceptPolicy(this.reg().id).subscribe({
      next: () => this.reg.update(r => ({ ...r, policyAccepted: true })),
      error: () => {},
    });
  }

  approve(): void {
    this.dialogRef.close({ action: 'approve', id: this.reg().id });
  }

  reject(): void {
    this.dialogRef.close({ action: 'reject', id: this.reg().id });
  }

  close(): void {
    this.dialogRef.close();
  }
}
