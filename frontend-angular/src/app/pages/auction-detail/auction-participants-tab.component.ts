import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, themeQuartz } from 'ag-grid-community';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

import { AuctionService } from '../../services/auction.service';
import { ChipCellRenderer } from '../../shared/ag-grid/chip-cell.renderer';

const SUCCESS = { bg: '#2e7d32', fg: '#ffffff' };
const EXPORT_API = 'http://localhost:8080/api/export/auction';

@Component({
  selector: 'app-set-winner-cell',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    @if (!isWinner) {
      <button mat-button color="primary" class="b" (click)="setWinner()">Set Winner</button>
    }
  `,
  styles: [`.b { min-width: 0; padding: 0 8px; line-height: 30px; font-size: 0.8125rem; }`]
})
export class SetWinnerCellRenderer implements ICellRendererAngularComp {
  isWinner = false;
  private params!: ICellRendererParams & { onSetWinner?: (r: any) => void };
  agInit(p: any): void { this.refresh(p); }
  refresh(p: any): boolean { this.params = p; this.isWinner = !!p.data?.winner; return true; }
  setWinner(): void { this.params.onSetWinner?.(this.params.data); }
}

@Component({
  selector: 'app-auction-participants-tab',
  standalone: true,
  imports: [CommonModule, AgGridAngular, MatButtonModule],
  template: `
    <div class="head">
      <div class="subtitle">Participants ({{ rows().length }})</div>
      <button mat-stroked-button class="btn-success" (click)="exportExcel()">Export Excel</button>
    </div>
    <ag-grid-angular class="grid" [theme]="theme" [rowData]="rows()" [columnDefs]="columnDefs"
      [domLayout]="'autoHeight'" [loading]="loading()" [suppressCellFocus]="true"></ag-grid-angular>
  `,
  styles: [`
    .head { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
    .subtitle { font-weight: 700; }
    .btn-success { color: #2e7d32; border-color: rgba(46,125,50,.5); }
    .grid { width: 100%; }
  `]
})
export class AuctionParticipantsTabComponent implements OnInit {
  @Input() auctionId!: string;
  rows = signal<any[]>([]);
  loading = signal(true);
  theme = themeQuartz;

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'company', headerName: 'Company', flex: 1, minWidth: 150, valueFormatter: p => p.value?.companyName ?? '-' },
    { field: 'status', headerName: 'Status', width: 130, cellRenderer: ChipCellRenderer, cellRendererParams: { labelGetter: (v: any) => v?.name ?? '' } },
    {
      field: 'winner', headerName: 'Winner', width: 90,
      cellRenderer: ChipCellRenderer,
      cellRendererParams: { visible: (v: any) => !!v, labelGetter: () => 'Winner', colorGetter: () => SUCCESS },
    },
    {
      field: 'actions', headerName: '', width: 130, sortable: false,
      cellRenderer: SetWinnerCellRenderer,
      cellRendererParams: { onSetWinner: (row: any) => this.setWinner(row.id) },
    },
  ];

  constructor(private auctionService: AuctionService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.auctionService.getParticipants(this.auctionId).subscribe({
      next: d => { this.rows.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  setWinner(id: number | string): void {
    this.auctionService.setWinner(id).subscribe({ next: () => this.load(), error: () => {} });
  }

  exportExcel(): void {
    this.auctionService.download(`${EXPORT_API}/${this.auctionId}/participants`).subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `participants_${this.auctionId}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      },
      error: () => {},
    });
  }
}
