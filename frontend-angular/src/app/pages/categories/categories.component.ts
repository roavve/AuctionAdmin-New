import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, themeQuartz } from 'ag-grid-community';

import { CategoryService } from '../../services/category.service';
import { ChipCellRenderer } from '../../shared/ag-grid/chip-cell.renderer';
import { EditDeleteActionsCellRenderer } from '../../shared/ag-grid/edit-delete-actions.renderer';
import { CategoryFormDialogComponent } from './category-form-dialog.component';

const ERROR = { bg: '#d32f2f', fg: '#ffffff' };
const SUCCESS = { bg: '#2e7d32', fg: '#ffffff' };

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, AgGridAngular, MatButtonModule, MatIconModule, MatPaginatorModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
})
export class CategoriesComponent implements OnInit {
  allRows = signal<any[]>([]);
  rows = signal<any[]>([]);
  loading = signal(true);
  error = signal('');
  actionMsg = signal('');
  parents = signal<any[]>([]);
  page = signal(0);
  pageSize = signal(20);

  theme = themeQuartz;

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'parent', headerName: 'Parent', width: 200, valueFormatter: p => p.value?.name ?? '-' },
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

  constructor(private categoryService: CategoryService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.load();
    this.loadParents();
  }

  load(): void {
    this.loading.set(true);
    this.categoryService.getAll().subscribe({
      next: (data: any[]) => {
        this.allRows.set(data);
        this.applyPage();
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load categories');
        this.loading.set(false);
      },
    });
  }

  loadParents(): void {
    this.categoryService.getParents().subscribe({
      next: p => this.parents.set(p),
      error: () => {},
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
    const ref = this.dialog.open(CategoryFormDialogComponent, {
      data: { item, parents: this.parents() },
      width: '500px',
    });
    ref.afterClosed().subscribe((r: any) => {
      if (r?.saved) {
        this.actionMsg.set(r.isEdit ? 'Category updated' : 'Category created');
        this.load();
        this.loadParents();
      } else if (r?.error) {
        this.actionMsg.set('Save failed');
      }
    });
  }

  handleDelete(id: number | string): void {
    if (!window.confirm('Delete this category?')) return;
    this.categoryService.delete(id).subscribe({
      next: () => { this.actionMsg.set('Category deleted'); this.load(); this.loadParents(); },
      error: () => this.actionMsg.set('Delete failed'),
    });
  }
}
