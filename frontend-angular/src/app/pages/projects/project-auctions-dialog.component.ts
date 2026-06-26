import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, themeQuartz } from 'ag-grid-community';

import { ChipCellRenderer, ChipColor } from '../../shared/ag-grid/chip-cell.renderer';
import { ButtonCellRenderer } from '../../shared/ag-grid/button-cell.renderer';

const AUCTION_STATUS_COLORS: Record<string, ChipColor> = {
  'key.auctionStatus.draft':     { bg: '#e0e0e0', fg: 'rgba(0, 0, 0, 0.87)' },
  'key.auctionStatus.active':    { bg: '#2e7d32', fg: '#ffffff' },
  'key.auctionStatus.planned':   { bg: '#0288d1', fg: '#ffffff' },
  'key.auctionStatus.completed': { bg: '#1976d2', fg: '#ffffff' },
  'key.auctionStatus.cancelled': { bg: '#d32f2f', fg: '#ffffff' },
};

@Component({
  selector: 'app-project-auctions-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, AgGridAngular],
  template: `
    <h2 mat-dialog-title class="dlg-title">
      Auctions in: {{ data.project?.name }}
      <span class="subtitle">{{ data.auctions.length }} auctions found</span>
    </h2>
    <mat-dialog-content>
      <ag-grid-angular
        class="grid"
        [theme]="theme"
        [rowData]="data.auctions"
        [columnDefs]="columnDefs"
        [domLayout]="'autoHeight'"
        [suppressCellFocus]="true">
      </ag-grid-angular>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dlg-title { display: flex; flex-direction: column; }
    .subtitle { font-size: 0.875rem; color: rgba(0,0,0,.6); font-weight: 400; }
    .grid { width: 100%; }
  `]
})
export class ProjectAuctionsDialogComponent {
  theme = themeQuartz;

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    {
      field: 'status', headerName: 'Status', width: 130,
      cellRenderer: ChipCellRenderer,
      cellRendererParams: {
        labelGetter: (v: any) => v?.name ?? '',
        colorGetter: (v: any) => AUCTION_STATUS_COLORS[v?.key] ?? null,
      },
    },
    { field: 'startBidValue', headerName: 'Start Bid', width: 110 },
    { field: 'lastBidValue', headerName: 'Last Bid', width: 110 },
    {
      field: 'actions', headerName: '', width: 90, sortable: false,
      cellRenderer: ButtonCellRenderer,
      cellRendererParams: {
        label: 'View',
        onClick: (row: any) => { this.dialogRef.close(); this.router.navigate(['/auctions', row.id]); },
      },
    },
  ];

  constructor(
    public dialogRef: MatDialogRef<ProjectAuctionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { project: any; auctions: any[] },
    private router: Router,
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
