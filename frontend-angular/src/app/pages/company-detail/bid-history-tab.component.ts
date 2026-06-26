import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, themeQuartz } from 'ag-grid-community';

import { CompanyService } from '../../services/company.service';
import { ChipCellRenderer } from '../../shared/ag-grid/chip-cell.renderer';
import { ButtonCellRenderer } from '../../shared/ag-grid/button-cell.renderer';

const SUCCESS = { bg: '#2e7d32', fg: '#ffffff' };
const ERROR = { bg: '#d32f2f', fg: '#ffffff' };

@Component({
  selector: 'app-bid-history-tab',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  template: `
    <div class="subtitle">Bid History ({{ rows().length }} auctions participated)</div>
    <ag-grid-angular class="grid" [theme]="theme" [rowData]="rows()" [columnDefs]="columnDefs"
      [domLayout]="'autoHeight'" [loading]="loading()" [suppressCellFocus]="true"></ag-grid-angular>
  `,
  styles: [`.subtitle { font-weight: 700; margin-bottom: 16px; } .grid { width: 100%; }`]
})
export class BidHistoryTabComponent implements OnInit {
  @Input() companyId!: string;
  rows = signal<any[]>([]);
  loading = signal(true);
  theme = themeQuartz;

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'auctionName', headerName: 'Auction', flex: 1, minWidth: 150,
      cellRenderer: ButtonCellRenderer,
      cellRendererParams: {
        labelGetter: (row: any) => row.auction?.name ?? '-',
        onClick: (row: any) => this.router.navigate(['/auctions', row.auction?.id]),
      },
    },
    { field: 'auctionProject', headerName: 'Project', width: 150, valueGetter: p => p.data.auction?.project?.name ?? '-' },
    {
      field: 'winner', headerName: 'Result', width: 100,
      cellRenderer: ChipCellRenderer,
      cellRendererParams: { labelGetter: (v: any) => (v ? 'WON' : 'LOST'), colorGetter: (v: any) => (v ? SUCCESS : ERROR) },
    },
    { field: 'startBid', headerName: 'Start Bid', width: 110, valueGetter: p => p.data.auction?.startBidValue ?? '-' },
    { field: 'lastBid', headerName: 'Last Bid', width: 110, valueGetter: p => p.data.auction?.lastBidValue ?? '-' },
    {
      field: 'auctionStatus', headerName: 'Auction Status', width: 130,
      valueGetter: p => p.data.auction?.status?.name ?? '',
      cellRenderer: ChipCellRenderer,
      cellRendererParams: { labelGetter: (v: any) => v ?? '' },
    },
  ];

  constructor(private companyService: CompanyService, private router: Router) {}

  ngOnInit(): void {
    this.companyService.getBidHistory(this.companyId).subscribe({
      next: d => { this.rows.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
