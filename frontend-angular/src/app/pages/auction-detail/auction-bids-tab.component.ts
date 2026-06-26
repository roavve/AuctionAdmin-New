import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, themeQuartz } from 'ag-grid-community';

import { AuctionService } from '../../services/auction.service';
import { ChipCellRenderer } from '../../shared/ag-grid/chip-cell.renderer';
import { ButtonCellRenderer } from '../../shared/ag-grid/button-cell.renderer';

@Component({
  selector: 'app-auction-bids-tab',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  template: `
    <ag-grid-angular class="grid" [theme]="theme" [rowData]="rows()" [columnDefs]="columnDefs"
      [domLayout]="'autoHeight'" [loading]="loading()" [suppressCellFocus]="true"></ag-grid-angular>
  `,
  styles: [`.grid { width: 100%; }`]
})
export class AuctionBidsTabComponent implements OnInit {
  @Input() auctionId!: string;
  rows = signal<any[]>([]);
  loading = signal(true);
  theme = themeQuartz;

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'bidValue', headerName: 'Bid Value', width: 120 },
    { field: 'bidDate', headerName: 'Date', width: 180, valueFormatter: p => (p.value ? new Date(p.value).toLocaleString() : '-') },
    {
      field: 'user', headerName: 'User', flex: 1, minWidth: 150,
      valueGetter: p => {
        const u = p.data.user;
        return u ? (`${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email) : '-';
      },
    },
    { field: 'status', headerName: 'Status', width: 120, cellRenderer: ChipCellRenderer, cellRendererParams: { labelGetter: (v: any) => v?.name ?? '' } },
    {
      field: 'actions', headerName: '', width: 100, sortable: false,
      cellRenderer: ButtonCellRenderer,
      cellRendererParams: {
        label: 'Cancel',
        color: 'warn',
        visible: (row: any) => row.status?.key === 'key.bid.active',
        onClick: (row: any) => this.cancelBid(row.id),
      },
    },
  ];

  constructor(private auctionService: AuctionService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.auctionService.getBids(this.auctionId).subscribe({
      next: d => { this.rows.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  cancelBid(id: number | string): void {
    this.auctionService.cancelBid(id).subscribe({ next: () => this.load(), error: () => {} });
  }
}
