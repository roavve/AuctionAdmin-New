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

import { UserService } from '../../services/user.service';
import { ChipCellRenderer } from '../../shared/ag-grid/chip-cell.renderer';
import { ButtonCellRenderer } from '../../shared/ag-grid/button-cell.renderer';

const PRIMARY = { bg: '#1976d2', fg: '#ffffff' };
const SUCCESS = { bg: '#2e7d32', fg: '#ffffff' };
const WARNING = { bg: '#ed6c02', fg: '#ffffff' };
const DEFAULT = { bg: '#e0e0e0', fg: 'rgba(0, 0, 0, 0.87)' };

interface UserFilters {
  email: string;
  companyId: string;
  internal: string;
  active: string;
  locked: string;
}

const EMPTY_FILTERS: UserFilters = { email: '', companyId: '', internal: '', active: '', locked: '' };

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, FormsModule, AgGridAngular,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatPaginatorModule,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit {
  rows = signal<any[]>([]);
  loading = signal(true);
  error = signal('');
  page = signal(0);
  pageSize = signal(20);
  total = signal(0);
  showFilters = signal(false);

  filters: UserFilters = { ...EMPTY_FILTERS };
  appliedFilters: UserFilters = { ...EMPTY_FILTERS };

  theme = themeQuartz;

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'firstName', headerName: 'First Name', width: 130 },
    { field: 'lastName', headerName: 'Last Name', width: 130 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
    { field: 'role', headerName: 'Role', width: 150 },
    {
      field: 'internal', headerName: 'Type', width: 100,
      cellRenderer: ChipCellRenderer,
      cellRendererParams: {
        labelGetter: (v: any) => (v ? 'Internal' : 'External'),
        colorGetter: (v: any) => (v ? PRIMARY : DEFAULT),
      },
    },
    {
      field: 'active', headerName: 'Active', width: 90,
      cellRenderer: ChipCellRenderer,
      cellRendererParams: {
        labelGetter: (v: any) => (v ? 'Active' : 'Inactive'),
        colorGetter: (v: any) => (v ? SUCCESS : DEFAULT),
      },
    },
    {
      field: 'locked', headerName: 'Locked', width: 90,
      cellRenderer: ChipCellRenderer,
      cellRendererParams: {
        visible: (v: any) => !!v,
        labelGetter: () => 'Locked',
        colorGetter: () => WARNING,
      },
    },
    {
      field: 'actions', headerName: '', width: 90, sortable: false,
      cellRenderer: ButtonCellRenderer,
      cellRendererParams: {
        label: 'View',
        onClick: (row: any) => this.router.navigate(['/users', row.id]),
      },
    },
  ];

  constructor(public router: Router, private userService: UserService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const f = this.appliedFilters;
    const params: any = { page: this.page(), size: this.pageSize() };
    if (f.email) params.email = f.email;
    if (f.internal !== '') params.internal = f.internal;
    if (f.active !== '') params.active = f.active;
    if (f.locked !== '') params.locked = f.locked;

    this.userService.search(params).subscribe({
      next: (res: any) => {
        this.rows.set(res.content);
        this.total.set(res.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load users');
        this.loading.set(false);
      },
    });
  }

  activeFilterCount(): number {
    return Object.values(this.appliedFilters).filter(v => v !== '').length;
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
