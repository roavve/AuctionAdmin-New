import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, themeQuartz } from 'ag-grid-community';

import { AuditService } from '../../services/audit.service';

interface AuditFilters {
  userId: string;
  action: string;
  objectName: string;
}

const EMPTY_FILTERS: AuditFilters = { userId: '', action: '', objectName: '' };

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [
    CommonModule, FormsModule, AgGridAngular,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatPaginatorModule,
  ],
  templateUrl: './audit-log.component.html',
  styleUrl: './audit-log.component.css',
})
export class AuditLogComponent implements OnInit {
  rows = signal<any[]>([]);
  loading = signal(true);
  error = signal('');
  total = signal(0);
  page = signal(0);
  pageSize = signal(20);
  showFilters = signal(false);

  filters: AuditFilters = { ...EMPTY_FILTERS };
  appliedFilters: AuditFilters = { ...EMPTY_FILTERS };

  theme = themeQuartz;

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'auditDate', headerName: 'Date', width: 180,
      valueFormatter: p => (p.value ? new Date(p.value).toLocaleString() : '-'),
    },
    { field: 'userId', headerName: 'User', width: 180 },
    { field: 'action', headerName: 'Action', width: 150 },
    { field: 'objectName', headerName: 'Object', width: 150 },
    { field: 'objectId', headerName: 'Object ID', width: 100 },
    { field: 'detail', headerName: 'Detail', flex: 1, minWidth: 150 },
  ];

  constructor(private auditService: AuditService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const f = this.appliedFilters;
    const params: any = { page: this.page(), size: this.pageSize() };
    if (f.userId) params.userId = f.userId;
    if (f.action) params.action = f.action;
    if (f.objectName) params.objectName = f.objectName;

    this.auditService.search(params).subscribe({
      next: (res: any) => {
        this.rows.set(res.content || []);
        this.total.set(res.totalElements || 0);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load audit log');
        this.loading.set(false);
      },
    });
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
