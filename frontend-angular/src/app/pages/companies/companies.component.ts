import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, themeQuartz } from 'ag-grid-community';

import { CompanyService } from '../../services/company.service';
import { CategoryService } from '../../services/category.service';
import { ChipCellRenderer } from '../../shared/ag-grid/chip-cell.renderer';
import { CompanyActionsCellRenderer } from './company-actions-cell.renderer';

const STATUS_KEYS: Record<number, string[]> = {
  0: ['key.companyStatus.created', 'key.companyStatus.invited', 'key.companyStatus.received', 'key.companyStatus.registered'],
  1: ['key.companyStatus.active'],
  2: ['key.companyStatus.cancelled', 'key.companyStatus.rejected'],
};

interface CompanyFilters {
  name: string;
  taxId: string;
  categoryId: string;
}

const EMPTY_FILTERS: CompanyFilters = { name: '', taxId: '', categoryId: '' };

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [
    CommonModule, FormsModule, AgGridAngular,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatTabsModule, MatPaginatorModule,
  ],
  templateUrl: './companies.component.html',
  styleUrl: './companies.component.css',
})
export class CompaniesComponent implements OnInit {
  tab = signal(0);
  rows = signal<any[]>([]);
  loading = signal(true);
  error = signal('');
  page = signal(0);
  pageSize = signal(20);
  total = signal(0);
  showFilters = signal(false);
  categories = signal<any[]>([]);

  filters: CompanyFilters = { ...EMPTY_FILTERS };
  appliedFilters: CompanyFilters = { ...EMPTY_FILTERS };

  theme = themeQuartz;

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'companyName', headerName: 'Company Name', flex: 1, minWidth: 150 },
    { field: 'taxId', headerName: 'Tax ID', width: 130 },
    { field: 'type', headerName: 'Type', width: 130, valueFormatter: p => p.value?.name ?? '-' },
    {
      field: 'status', headerName: 'Status', width: 130,
      cellRenderer: ChipCellRenderer,
      cellRendererParams: { labelGetter: (v: any) => v?.name ?? '' },
    },
    { field: 'category', headerName: 'Category', width: 150, valueFormatter: p => p.value?.name ?? '-' },
    { field: 'contactEmail', headerName: 'Email', width: 200 },
    { field: 'contactPhone', headerName: 'Phone', width: 130 },
    {
      field: 'flowDateCreated', headerName: 'Date Created', width: 130,
      valueFormatter: p => (p.value ? new Date(p.value).toLocaleDateString() : '-'),
    },
    {
      field: 'actions', headerName: '', width: 180, sortable: false,
      cellRenderer: CompanyActionsCellRenderer,
      cellRendererParams: {
        onView: (row: any) => this.router.navigate(['/companies', row.id]),
        onInvite: (row: any) => this.handleInvite(row.id),
      },
    },
  ];

  constructor(
    public router: Router,
    private companyService: CompanyService,
    private categoryService: CategoryService,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.load();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: c => this.categories.set(c),
      error: () => {},
    });
  }

  load(): void {
    this.loading.set(true);
    this.companyService.getAll().subscribe({
      next: (data: any[]) => {
        const allowed = STATUS_KEYS[this.tab()];
        let filtered = data.filter(c => allowed.includes(c.status?.key));
        const f = this.appliedFilters;
        if (f.name) filtered = filtered.filter(c => c.companyName?.toLowerCase().includes(f.name.toLowerCase()));
        if (f.taxId) filtered = filtered.filter(c => c.taxId?.toLowerCase().includes(f.taxId.toLowerCase()));
        if (f.categoryId) filtered = filtered.filter(c => c.category?.id === Number(f.categoryId));

        this.total.set(filtered.length);
        const start = this.page() * this.pageSize();
        this.rows.set(filtered.slice(start, start + this.pageSize()));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load companies');
        this.loading.set(false);
      },
    });
  }

  handleInvite(id: number | string): void {
    this.companyService.invite(id).subscribe({
      next: () => this.load(),
      error: () => {},
    });
  }

  activeFilterCount(): number {
    return Object.values(this.appliedFilters).filter(v => v !== '').length;
  }

  onTab(i: number): void {
    this.tab.set(i);
    this.page.set(0);
    this.load();
  }

  handleSearch(): void {
    this.page.set(0);
    this.appliedFilters = { ...this.filters };
    this.load();
  }

  handleClear(): void {
    this.filters = { ...EMPTY_FILTERS };
    this.appliedFilters = { ...EMPTY_FILTERS };
    this.page.set(0);
    this.load();
  }

  onPage(e: PageEvent): void {
    this.page.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
    this.load();
  }
}
