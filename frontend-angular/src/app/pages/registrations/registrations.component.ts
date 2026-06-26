import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, themeQuartz } from 'ag-grid-community';

import { RegistrationService } from '../../services/registration.service';
import { RegistrationActionsCellRenderer } from './registration-actions-cell.renderer';
import { RegistrationDetailDialogComponent } from './registration-detail-dialog.component';

const TAB_KEYS = ['new', 'processed', 'cancelled'];

@Component({
  selector: 'app-registrations',
  standalone: true,
  imports: [CommonModule, AgGridAngular, MatTabsModule, MatPaginatorModule],
  templateUrl: './registrations.component.html',
  styleUrl: './registrations.component.css',
})
export class RegistrationsComponent implements OnInit {
  tab = signal(0);
  rows = signal<any[]>([]);
  loading = signal(true);
  total = signal(0);
  page = signal(0);
  pageSize = signal(20);
  error = signal('');
  actionMsg = signal('');

  theme = themeQuartz;

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'companyName', headerName: 'Company Name', flex: 1, minWidth: 150 },
    { field: 'taxId', headerName: 'Tax ID', width: 130 },
    { field: 'contactEmail', headerName: 'Email', width: 200 },
    { field: 'contactPhone', headerName: 'Phone', width: 130 },
    {
      field: 'contactName', headerName: 'Contact', width: 130,
      valueGetter: p => `${p.data?.contactName || ''} ${p.data?.contactSurname || ''}`.trim() || '-',
    },
    {
      field: 'requestDate', headerName: 'Date', width: 130,
      valueFormatter: p => (p.value ? new Date(p.value).toLocaleDateString() : '-'),
    },
    {
      field: 'actions', headerName: '', width: 260, sortable: false,
      cellRenderer: RegistrationActionsCellRenderer,
      cellRendererParams: {
        isNew: () => this.tab() === 0,
        onView: (row: any) => this.openDetail(row),
        onApprove: (row: any) => this.handleApprove(row.id),
        onReject: (row: any) => this.handleReject(row.id),
      },
    },
  ];

  constructor(
    private registrationService: RegistrationService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.registrationService.getByStatus(TAB_KEYS[this.tab()], this.page(), this.pageSize()).subscribe({
      next: (data: any) => {
        this.rows.set(data.content || []);
        this.total.set(data.totalElements || 0);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load registrations');
        this.loading.set(false);
      },
    });
  }

  handleApprove(id: number | string): void {
    this.registrationService.createCompany(id).subscribe({
      next: (data: any) => {
        if (data.success) {
          this.actionMsg.set(`Company created successfully (ID: ${data.companyId})`);
          this.load();
        } else {
          this.actionMsg.set('Failed: ' + data.error);
        }
      },
      error: () => this.actionMsg.set('Action failed'),
    });
  }

  handleReject(id: number | string): void {
    this.registrationService.reject(id).subscribe({
      next: () => { this.actionMsg.set('Registration rejected'); this.load(); },
      error: () => this.actionMsg.set('Action failed'),
    });
  }

  openDetail(reg: any): void {
    const ref = this.dialog.open(RegistrationDetailDialogComponent, {
      data: { reg, isNew: this.tab() === 0 },
      width: '900px',
      maxWidth: '90vw',
    });
    ref.afterClosed().subscribe((result: any) => {
      if (result?.action === 'approve') this.handleApprove(result.id);
      else if (result?.action === 'reject') this.handleReject(result.id);
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
