import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, themeQuartz } from 'ag-grid-community';

import { TemplateService } from '../../services/template.service';
import { ChipCellRenderer } from '../../shared/ag-grid/chip-cell.renderer';
import { ButtonCellRenderer } from '../../shared/ag-grid/button-cell.renderer';
import { TemplateEditDialogComponent } from './template-edit-dialog.component';

const ERROR = { bg: '#d32f2f', fg: '#ffffff' };
const SUCCESS = { bg: '#2e7d32', fg: '#ffffff' };

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [CommonModule, AgGridAngular, MatPaginatorModule],
  templateUrl: './templates.component.html',
  styleUrl: './templates.component.css',
})
export class TemplatesComponent implements OnInit {
  allRows = signal<any[]>([]);
  rows = signal<any[]>([]);
  loading = signal(true);
  error = signal('');
  actionMsg = signal('');
  page = signal(0);
  pageSize = signal(10);

  theme = themeQuartz;

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Template Name', width: 220 },
    { field: 'tkey', headerName: 'Key', width: 220 },
    { field: 'subject', headerName: 'Subject', flex: 1, minWidth: 150 },
    {
      field: 'disabled', headerName: 'Status', width: 100,
      cellRenderer: ChipCellRenderer,
      cellRendererParams: {
        labelGetter: (v: any) => (v ? 'Disabled' : 'Active'),
        colorGetter: (v: any) => (v ? ERROR : SUCCESS),
      },
    },
    {
      field: 'actions', headerName: '', width: 90, sortable: false,
      cellRenderer: ButtonCellRenderer,
      cellRendererParams: {
        label: 'Edit',
        onClick: (row: any) => this.openEdit(row),
      },
    },
  ];

  constructor(private templateService: TemplateService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.templateService.getAll().subscribe({
      next: (data: any[]) => {
        this.allRows.set(data);
        this.applyPage();
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load templates');
        this.loading.set(false);
      },
    });
  }

  applyPage(): void {
    const start = this.page() * this.pageSize();
    this.rows.set(this.allRows().slice(start, start + this.pageSize()));
  }

  onPage(e: PageEvent): void {
    this.page.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
    this.applyPage();
  }

  openEdit(row: any): void {
    const ref = this.dialog.open(TemplateEditDialogComponent, {
      data: { template: row },
      width: '800px',
      maxWidth: '90vw',
    });
    ref.afterClosed().subscribe((r: any) => {
      if (r?.saved) {
        this.actionMsg.set('Template saved successfully');
        this.load();
      } else if (r?.error) {
        this.actionMsg.set('Save failed');
      }
    });
  }
}
