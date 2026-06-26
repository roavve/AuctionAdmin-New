import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, themeQuartz } from 'ag-grid-community';

import { AuctionService } from '../../services/auction.service';
import { ChipCellRenderer } from '../../shared/ag-grid/chip-cell.renderer';

@Component({
  selector: 'app-auction-comments-tab',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  template: `
    <ag-grid-angular class="grid" [theme]="theme" [rowData]="rows()" [columnDefs]="columnDefs"
      [domLayout]="'autoHeight'" [loading]="loading()" [suppressCellFocus]="true"></ag-grid-angular>
  `,
  styles: [`.grid { width: 100%; }`]
})
export class AuctionCommentsTabComponent implements OnInit {
  @Input() auctionId!: string;
  rows = signal<any[]>([]);
  loading = signal(true);
  theme = themeQuartz;

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'commCreated', headerName: 'Date', width: 160, valueFormatter: p => (p.value ? new Date(p.value).toLocaleString() : '-') },
    { field: 'user', headerName: 'Company', width: 160, valueFormatter: p => p.value?.company?.companyName ?? p.value?.email ?? '-' },
    { field: 'commText', headerName: 'Comment', flex: 1, minWidth: 200, wrapText: true, autoHeight: true },
    { field: 'status', headerName: 'Status', width: 120, cellRenderer: ChipCellRenderer, cellRendererParams: { labelGetter: (v: any) => v?.name ?? '' } },
  ];

  constructor(private auctionService: AuctionService) {}

  ngOnInit(): void {
    this.auctionService.getComments(this.auctionId).subscribe({
      next: all => { this.rows.set(all.filter((c: any) => !c.answerToKey)); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
