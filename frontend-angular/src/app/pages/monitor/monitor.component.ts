import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, themeQuartz } from 'ag-grid-community';

import { AuctionService } from '../../services/auction.service';
import { ButtonCellRenderer } from '../../shared/ag-grid/button-cell.renderer';

const TAB_TYPES = ['active', 'planned', 'closed', 'cancelled'];

@Component({
  selector: 'app-monitor',
  standalone: true,
  imports: [CommonModule, AgGridAngular, MatTabsModule, MatPaginatorModule],
  templateUrl: './monitor.component.html',
  styleUrl: './monitor.component.css',
})
export class MonitorComponent implements OnInit {
  tab = signal(0);
  rows = signal<any[]>([]);
  total = signal(0);
  loading = signal(true);
  page = signal(0);
  pageSize = signal(20);

  theme = themeQuartz;

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'startBidValue', headerName: 'Start Bid', width: 110 },
    { field: 'lastBidValue', headerName: 'Last Bid', width: 110 },
    { field: 'project', headerName: 'Project', width: 160, valueFormatter: p => p.value?.name ?? '-' },
    {
      field: 'auctionStartDate', headerName: 'Start Date', width: 120,
      valueFormatter: p => (p.value ? new Date(p.value).toLocaleDateString() : '-'),
    },
    {
      field: 'actions', headerName: '', width: 90, sortable: false,
      cellRenderer: ButtonCellRenderer,
      cellRendererParams: {
        label: 'View',
        onClick: (row: any) => this.router.navigate(['/auctions', row.id]),
      },
    },
  ];

  constructor(private router: Router, private auctionService: AuctionService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.auctionService.monitor(TAB_TYPES[this.tab()], { page: this.page(), size: this.pageSize() }).subscribe({
      next: (res: any) => {
        this.rows.set(res.content);
        this.total.set(res.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.rows.set([]);
        this.loading.set(false);
      },
    });
  }

  onTab(index: number): void {
    this.tab.set(index);
    this.page.set(0);
    this.load();
  }

  onPage(e: PageEvent): void {
    this.page.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
    this.load();
  }
}
