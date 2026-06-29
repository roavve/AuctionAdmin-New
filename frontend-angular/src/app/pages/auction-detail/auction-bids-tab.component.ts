import { Component, Input, OnInit, computed, signal } from '@angular/core';
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
    @if (summary(); as s) {
      <div class="cards">
        <div class="card best">
          <div class="label">🥇 Best Bid</div>
          <div class="value">{{ s.first.toLocaleString() }} {{ currencyName }}</div>
          <div class="who">{{ s.firstName }}</div>
        </div>
        <div class="card second">
          <div class="label">🥈 2nd Place</div>
          <div class="value">{{ s.second.toLocaleString() }} {{ currencyName }}</div>
          <div class="who">{{ s.secondName }}</div>
        </div>
        <div class="card gap">
          <div class="gap-label">Gap</div>
          <div class="gap-value">{{ s.gap }}%</div>
          <div class="gap-label">1st ahead by</div>
        </div>
      </div>
    }

    <ag-grid-angular class="grid" [theme]="theme" [rowData]="rows()" [columnDefs]="columnDefs"
                     [domLayout]="'autoHeight'" [loading]="loading()" [suppressCellFocus]="true"></ag-grid-angular>
  `,
  styles: [`
    .cards { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; }
    .card {
      padding: 16px; border-radius: 4px;
      box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
    }
    .card.best { background: #2e7d32; color: #fff; min-width: 160px; }
    .card.second { background: #0288d1; color: #fff; min-width: 160px; }
    .card.gap { min-width: 120px; text-align: center; background: #fff; }
    .label { font-size: 0.875rem; }
    .value { font-size: 1.25rem; font-weight: 700; margin: 2px 0; }
    .who { font-size: 0.875rem; }
    .gap-label { font-size: 0.875rem; color: rgba(0,0,0,.6); }
    .gap-value { font-size: 2.125rem; font-weight: 700; color: #ed6c02; line-height: 1.2; }
    .grid { width: 100%; }
  `]
})
export class AuctionBidsTabComponent implements OnInit {
  @Input() auctionId!: string;
  @Input() currencyName = '';

  rows = signal<any[]>([]);
  loading = signal(true);
  theme = themeQuartz;

  summary = computed(() => {
    const active = this.rows()
      .filter(b => b.status?.key === 'key.bid.active')
      .sort((a, b) => a.bidValue - b.bidValue);
    if (active.length < 2) return null;
    const first = active[0].bidValue;
    const second = active[1].bidValue;
    const gap = ((second - first) / second * 100).toFixed(1);
    return {
      first,
      second,
      gap,
      firstName: active[0].user?.company?.companyName || active[0].user?.email || '-',
      secondName: active[1].user?.company?.companyName || active[1].user?.email || '-',
    };
  });

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
