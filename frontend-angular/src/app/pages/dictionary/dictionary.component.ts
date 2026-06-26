import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, themeQuartz } from 'ag-grid-community';

import { DictionaryService } from '../../services/dictionary.service';
import { ChipCellRenderer } from '../../shared/ag-grid/chip-cell.renderer';
import { EditDeleteActionsCellRenderer } from '../../shared/ag-grid/edit-delete-actions.renderer';
import { DictionaryFormDialogComponent } from './dictionary-form-dialog.component';

const ERROR = { bg: '#d32f2f', fg: '#ffffff' };
const SUCCESS = { bg: '#2e7d32', fg: '#ffffff' };

@Component({
  selector: 'app-dictionary',
  standalone: true,
  imports: [CommonModule, AgGridAngular, MatButtonModule, MatIconModule, MatPaginatorModule],
  templateUrl: './dictionary.component.html',
  styleUrl: './dictionary.component.css',
})
export class DictionaryComponent implements OnInit {
  allRows = signal<any[]>([]);
  rows = signal<any[]>([]);
  loading = signal(true);
  error = signal('');
  actionMsg = signal('');
  page = signal(0);
  pageSize = signal(20);

  theme = themeQuartz;

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'key', headerName: 'Key', width: 250 },
    { field: 'name', headerName: 'Name (EN)', width: 200 },
    { field: 'nameGE', headerName: 'Name (GE)', width: 200 },
    { field: 'sortOrder', headerName: 'Order', width: 80 },
    {
      field: 'disabled', headerName: 'Status', width: 100,
      cellRenderer: ChipCellRenderer,
      cellRendererParams: {
        labelGetter: (v: any) => (v ? 'Disabled' : 'Active'),
        colorGetter: (v: any) => (v ? ERROR : SUCCESS),
      },
    },
    {
      field: 'actions', headerName: '', width: 160, sortable: false,
      cellRenderer: EditDeleteActionsCellRenderer,
      cellRendererParams: {
        onEdit: (row: any) => this.openForm(row),
        onDelete: (row: any) => this.handleDelete(row.id),
      },
    },
  ];

  constructor(private dictionaryService: DictionaryService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.dictionaryService.getItems().subscribe({
      next: (data: any[]) => {
        this.allRows.set(data);
        this.applyPage();
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load dictionary items');
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

  openForm(item: any | null): void {
    const ref = this.dialog.open(DictionaryFormDialogComponent, { data: { item }, width: '500px' });
    ref.afterClosed().subscribe((r: any) => {
      if (r?.saved) {
        this.actionMsg.set(r.isEdit ? 'Item updated' : 'Item created');
        this.load();
      } else if (r?.error) {
        this.actionMsg.set('Save failed');
      }
    });
  }

  handleDelete(id: number | string): void {
    if (!window.confirm('Delete this dictionary item? This may break system functionality!')) return;
    this.dictionaryService.delete(id).subscribe({
      next: () => { this.actionMsg.set('Item deleted'); this.load(); },
      error: () => this.actionMsg.set('Delete failed'),
    });
  }
}
