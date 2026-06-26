import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, themeQuartz, GetRowIdParams } from 'ag-grid-community';

import { CompanyService } from '../../services/company.service';
import { ChipCellRenderer } from '../../shared/ag-grid/chip-cell.renderer';

const SUCCESS = { bg: '#2e7d32', fg: '#ffffff' };
const ERROR = { bg: '#d32f2f', fg: '#ffffff' };

@Component({
  selector: 'app-project-stats-tab',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  template: `
    <div class="subtitle">Project Statistics ({{ rows().length }} projects participated)</div>
    <ag-grid-angular class="grid" [theme]="theme" [rowData]="rows()" [columnDefs]="columnDefs"
      [getRowId]="getRowId" [domLayout]="'autoHeight'" [loading]="loading()" [suppressCellFocus]="true"></ag-grid-angular>
  `,
  styles: [`.subtitle { font-weight: 700; margin-bottom: 16px; } .grid { width: 100%; }`]
})
export class ProjectStatsTabComponent implements OnInit {
  @Input() companyId!: string;
  rows = signal<any[]>([]);
  loading = signal(true);
  theme = themeQuartz;

  getRowId = (params: GetRowIdParams) => String(params.data.projectId);

  columnDefs: ColDef[] = [
    { field: 'projectId', headerName: 'ID', width: 70 },
    { field: 'projectName', headerName: 'Project', flex: 1, minWidth: 150 },
    { field: 'auctionCount', headerName: 'Total Auctions', width: 130 },
    {
      field: 'wonCount', headerName: 'Won', width: 90,
      cellRenderer: ChipCellRenderer,
      cellRendererParams: { labelGetter: (v: any) => String(v ?? 0), colorGetter: () => SUCCESS },
    },
    {
      field: 'lostCount', headerName: 'Lost', width: 90,
      cellRenderer: ChipCellRenderer,
      cellRendererParams: { labelGetter: (v: any) => String(v ?? 0), colorGetter: () => ERROR },
    },
    {
      field: 'winRate', headerName: 'Win Rate', width: 110,
      valueGetter: p => (p.data.auctionCount > 0 ? ((p.data.wonCount / p.data.auctionCount) * 100).toFixed(1) + '%' : '0%'),
    },
  ];

  constructor(private companyService: CompanyService) {}

  ngOnInit(): void {
    this.companyService.getProjectStats(this.companyId).subscribe({
      next: d => { this.rows.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
