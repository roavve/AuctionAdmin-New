import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, themeQuartz } from 'ag-grid-community';

import { AuctionService } from '../../services/auction.service';
import { ProjectService } from '../../services/project.service';
import { DictionaryService } from '../../services/dictionary.service';
import { ChipCellRenderer, ChipColor } from '../../shared/ag-grid/chip-cell.renderer';
import { ButtonCellRenderer } from '../../shared/ag-grid/button-cell.renderer';

const AUCTION_STATUS_COLORS: Record<string, ChipColor> = {
  'key.auctionStatus.draft':     { bg: '#e0e0e0', fg: 'rgba(0, 0, 0, 0.87)' }, // default
  'key.auctionStatus.active':    { bg: '#2e7d32', fg: '#ffffff' },             // success
  'key.auctionStatus.planned':   { bg: '#0288d1', fg: '#ffffff' },             // info
  'key.auctionStatus.completed': { bg: '#1976d2', fg: '#ffffff' },             // primary
  'key.auctionStatus.cancelled': { bg: '#d32f2f', fg: '#ffffff' },             // error
};

interface AuctionFilters {
  statusId: string;
  projectId: string;
  rangeStartAmount: string;
  rangeEndAmount: string;
  rangeStartDate: string;
}

const EMPTY_FILTERS: AuctionFilters = {
  statusId: '',
  projectId: '',
  rangeStartAmount: '',
  rangeEndAmount: '',
  rangeStartDate: '',
};

@Component({
  selector: 'app-auctions',
  standalone: true,
  imports: [
    CommonModule, FormsModule, AgGridAngular,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatPaginatorModule,
  ],
  templateUrl: './auctions.component.html',
  styleUrl: './auctions.component.css',
})
export class AuctionsComponent implements OnInit {
  rows = signal<any[]>([]);
  loading = signal(true);
  error = signal('');
  page = signal(0);
  pageSize = signal(20);
  total = signal(0);
  showFilters = signal(false);
  statuses = signal<any[]>([]);
  projects = signal<any[]>([]);


  filters: AuctionFilters = { ...EMPTY_FILTERS };
  appliedFilters: AuctionFilters = { ...EMPTY_FILTERS };

  theme = themeQuartz;

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    {
      field: 'status', headerName: 'Status', width: 140,
      cellRenderer: ChipCellRenderer,
      cellRendererParams: {
        labelGetter: (v: any) => v?.name ?? '',
        colorGetter: (v: any) => AUCTION_STATUS_COLORS[v?.key] ?? null,
      },
    },
    { field: 'project', headerName: 'Project', width: 160, valueFormatter: p => p.value?.name ?? '-' },
    { field: 'startBidValue', headerName: 'Start Bid', width: 110 },
    { field: 'lastBidValue', headerName: 'Last Bid', width: 110 },
    { field: 'createUserId', headerName: 'Administrator', width: 130 },
    {
      field: 'auctionStartDate', headerName: 'Start Date', width: 120,
      valueFormatter: p => (p.value ? new Date(p.value).toLocaleDateString() : '-'),
    },
    { field: 'allParticipants', headerName: 'All Participants', width: 130, valueFormatter: p => p.value ?? 0 },
    { field: 'activeParticipants', headerName: 'Active Participants', width: 140,
      wrapHeaderText: true, autoHeaderHeight: true,
      valueFormatter: p => p.value ?? 0 },    {
      field: 'actions', headerName: '', width: 100, sortable: false,
      cellRenderer: ButtonCellRenderer,
      cellRendererParams: {
        label: 'View',
        onClick: (row: any) => this.router.navigate(['/auctions', row.id]),
      },
    },
  ];

  constructor(
    public router: Router,
    private auctionService: AuctionService,
    private projectService: ProjectService,
    private dictionaryService: DictionaryService,
  ) {}

  ngOnInit(): void {
    this.loadDropdowns();
    this.loadAuctions();
  }

  activeFilterCount(): number {
    return Object.values(this.appliedFilters).filter(v => v !== '').length;
  }

  statusColor(key: string): ChipColor | null {
    return AUCTION_STATUS_COLORS[key] ?? null;
  }

  loadDropdowns(): void {
    this.dictionaryService.getItems().subscribe({
      next: items => this.statuses.set(items.filter(d => d.key?.startsWith('key.auctionStatus'))),
      error: () => {},
    });
    this.projectService.getAll().subscribe({
      next: (p: any) => this.projects.set(p),
      error: () => {},
    });
  }

  loadAuctions(): void {
    this.loading.set(true);
    const f = this.appliedFilters;
    const params: any = { page: this.page(), size: this.pageSize() };
    if (f.statusId) params.statusId = f.statusId;
    if (f.projectId) params.projectId = f.projectId;
    if (f.rangeStartAmount) params.rangeStartAmount = f.rangeStartAmount;
    if (f.rangeEndAmount) params.rangeEndAmount = f.rangeEndAmount;
    if (f.rangeStartDate) params.rangeStartDate = f.rangeStartDate;

    this.auctionService.search(params).subscribe({
      next: (res: any) => {
        this.rows.set(res.content);
        this.total.set(res.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load auctions');
        this.loading.set(false);
      },
    });
  }

  handleSearch(): void {
    this.page.set(0);
    this.appliedFilters = { ...this.filters };
    this.loadAuctions();
  }

  handleClear(): void {
    this.filters = { ...EMPTY_FILTERS };
    this.appliedFilters = { ...EMPTY_FILTERS };
    this.page.set(0);
    this.loadAuctions();
  }

  onPage(e: PageEvent): void {
    this.page.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
    this.loadAuctions();
  }
}
