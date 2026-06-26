import { Component, Inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, themeQuartz } from 'ag-grid-community';

import { CompanyService } from '../../services/company.service';
import { CategoryService } from '../../services/category.service';
import { EditDeleteActionsCellRenderer } from '../../shared/ag-grid/edit-delete-actions.renderer';

@Component({
  selector: 'app-add-company-category-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>Add Category</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full">
        <mat-label>Category</mat-label>
        <mat-select [(ngModel)]="form.categoryId" (ngModelChange)="onCategoryChange($event)">
          @for (c of parents; track c.id) { <mat-option [value]="c.id">{{ c.name }}</mat-option> }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" class="full">
        <mat-label>Sub Category</mat-label>
        <mat-select [(ngModel)]="form.subCategoryId">
          <mat-option value="">None</mat-option>
          @for (s of subCategories(); track s.id) { <mat-option [value]="s.id">{{ s.name }}</mat-option> }
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="!form.categoryId" (click)="add()">Add</button>
    </mat-dialog-actions>
  `,
  styles: [`.full { width: 100%; display: block; margin-bottom: 16px; }`]
})
export class AddCompanyCategoryDialogComponent {
  form = { categoryId: '' as any, subCategoryId: '' as any };
  subCategories = signal<any[]>([]);
  parents: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<AddCompanyCategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { allCategories: any[] },
  ) {
    this.parents = data.allCategories.filter(c => !c.parent);
  }

  onCategoryChange(categoryId: any): void {
    this.form.subCategoryId = '';
    this.subCategories.set(this.data.allCategories.filter(c => c.parent?.id === Number(categoryId)));
  }

  add(): void {
    this.dialogRef.close({
      categoryId: this.form.categoryId,
      subCategoryId: this.form.subCategoryId || null,
    });
  }
}

@Component({
  selector: 'app-company-categories-tab',
  standalone: true,
  imports: [CommonModule, AgGridAngular, MatButtonModule, MatIconModule],
  template: `
    <div class="head">
      <div class="subtitle">Categories ({{ rows().length }})</div>
      <button mat-raised-button color="primary" (click)="openAdd()">
        <mat-icon>add</mat-icon>
        Add Category
      </button>
    </div>
    <ag-grid-angular class="grid" [theme]="theme" [rowData]="rows()" [columnDefs]="columnDefs"
      [domLayout]="'autoHeight'" [loading]="loading()" [suppressCellFocus]="true"></ag-grid-angular>
  `,
  styles: [`
    .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .subtitle { font-weight: 700; }
    .head mat-icon { margin-right: 4px; }
    .grid { width: 100%; }
  `]
})
export class CompanyCategoriesTabComponent implements OnInit {
  @Input() companyId!: string;
  rows = signal<any[]>([]);
  allCategories = signal<any[]>([]);
  loading = signal(true);
  theme = themeQuartz;

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'category', headerName: 'Category', flex: 1, minWidth: 150, valueFormatter: p => p.value?.name ?? '-' },
    { field: 'subCategory', headerName: 'Sub Category', width: 200, valueFormatter: p => p.value?.name ?? '-' },
    {
      field: 'actions', headerName: '', width: 90, sortable: false,
      cellRenderer: EditDeleteActionsCellRenderer,
      cellRendererParams: {
        onEdit: () => {},
        onDelete: (row: any) => this.handleDelete(row.id),
      },
    },
  ];

  constructor(
    private companyService: CompanyService,
    private categoryService: CategoryService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.load();
    this.categoryService.getAll().subscribe({ next: c => this.allCategories.set(c), error: () => {} });
  }

  load(): void {
    this.loading.set(true);
    this.companyService.getCategories(this.companyId).subscribe({
      next: d => { this.rows.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openAdd(): void {
    const ref = this.dialog.open(AddCompanyCategoryDialogComponent, {
      data: { allCategories: this.allCategories() },
      width: '500px',
    });
    ref.afterClosed().subscribe((body: any) => {
      if (body) {
        this.companyService.addCategory(this.companyId, body).subscribe({
          next: () => this.load(),
          error: () => {},
        });
      }
    });
  }

  handleDelete(companyCategoryId: number | string): void {
    if (!window.confirm('Remove this category?')) return;
    this.companyService.deleteCategory(this.companyId, companyCategoryId).subscribe({
      next: () => this.load(),
      error: () => {},
    });
  }
}
