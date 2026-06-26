import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, themeQuartz } from 'ag-grid-community';

import { AuctionService } from '../../services/auction.service';
import { ChipCellRenderer } from '../../shared/ag-grid/chip-cell.renderer';

const SUCCESS = { bg: '#2e7d32', fg: '#ffffff' };

@Component({
  selector: 'app-auction-revisions-tab',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  template: `
    <div class="subtitle">Revisions</div>
    <ag-grid-angular class="grid" [theme]="theme" [rowData]="rows()" [columnDefs]="columnDefs"
      [domLayout]="'autoHeight'" [loading]="loading()" [suppressCellFocus]="true"></ag-grid-angular>
  `,
  styles: [`.subtitle { font-weight: 700; margin-bottom: 16px; } .grid { width: 100%; }`]
})
export class AuctionRevisionsTabComponent implements OnInit {
  @Input() auctionId!: string;
  rows = signal<any[]>([]);
  loading = signal(true);
  theme = themeQuartz;

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'revisionNum', headerName: 'Revision #', width: 110 },
    { field: 'revisionDate', headerName: 'Date', width: 180, valueFormatter: p => (p.value ? new Date(p.value).toLocaleString() : '-') },
    {
      field: 'current', headerName: 'Current', width: 100,
      cellRenderer: ChipCellRenderer,
      cellRendererParams: { visible: (v: any) => !!v, labelGetter: () => 'Current', colorGetter: () => SUCCESS },
    },
  ];

  constructor(private auctionService: AuctionService) {}

  ngOnInit(): void {
    this.auctionService.getRevisions(this.auctionId).subscribe({
      next: d => { this.rows.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
