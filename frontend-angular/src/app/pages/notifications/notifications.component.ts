import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, themeQuartz } from 'ag-grid-community';

import { NotificationService } from '../../services/notification.service';
import { ChipCellRenderer } from '../../shared/ag-grid/chip-cell.renderer';

const PRIMARY = { bg: '#1976d2', fg: '#ffffff' };
const SECONDARY = { bg: '#9c27b0', fg: '#ffffff' };

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, AgGridAngular, MatPaginatorModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
})
export class NotificationsComponent implements OnInit {
  rows = signal<any[]>([]);
  loading = signal(true);
  error = signal('');
  total = signal(0);
  page = signal(0);
  pageSize = signal(20);

  theme = themeQuartz;

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'createDate', headerName: 'Date', width: 180,
      valueFormatter: p => (p.value ? new Date(p.value).toLocaleString() : '-'),
    },
    { field: 'sendSubject', headerName: 'Subject', flex: 1, minWidth: 150 },
    { field: 'sendText', headerName: 'Text', flex: 2, minWidth: 200 },
    {
      field: 'isEmail', headerName: 'Email', width: 90,
      cellRenderer: ChipCellRenderer,
      cellRendererParams: {
        visible: (v: any) => !!v,
        labelGetter: () => 'Email',
        colorGetter: () => PRIMARY,
      },
    },
    {
      field: 'isSms', headerName: 'SMS', width: 90,
      cellRenderer: ChipCellRenderer,
      cellRendererParams: {
        visible: (v: any) => !!v,
        labelGetter: () => 'SMS',
        colorGetter: () => SECONDARY,
      },
    },
    { field: 'emailStatus', headerName: 'Email Status', width: 120 },
    { field: 'smsStatus', headerName: 'SMS Status', width: 120 },
  ];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.notificationService.search(this.page(), this.pageSize()).subscribe({
      next: (data: any) => {
        this.rows.set(data.content || []);
        this.total.set(data.totalElements || 0);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load notifications');
        this.loading.set(false);
      },
    });
  }

  onPage(e: PageEvent): void {
    this.page.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
    this.load();
  }
}
