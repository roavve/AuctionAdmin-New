import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-category-form-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatSlideToggleModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.item ? 'Edit Category' : 'New Category' }}</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full">
        <mat-label>Name</mat-label>
        <input matInput [(ngModel)]="form.name" required />
      </mat-form-field>
      <mat-form-field appearance="outline" class="full">
        <mat-label>Parent Category (leave empty for top-level)</mat-label>
        <mat-select [(ngModel)]="form.parentId">
          <mat-option value="">None (Top Level)</mat-option>
          @for (p of data.parents; track p.id) {
            <mat-option [value]="p.id">{{ p.name }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-slide-toggle [(ngModel)]="form.disabled">Disabled</mat-slide-toggle>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="saving() || !form.name" (click)="save()">
        {{ saving() ? 'Saving...' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full { width: 100%; display: block; margin-bottom: 16px; }
  `]
})
export class CategoryFormDialogComponent {
  form: { name: string; parentId: any; disabled: boolean };
  saving = signal(false);

  constructor(
    public dialogRef: MatDialogRef<CategoryFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { item: any | null; parents: any[] },
    private categoryService: CategoryService,
  ) {
    this.form = data.item
      ? { name: data.item.name || '', parentId: data.item.parent?.id || '', disabled: data.item.disabled || false }
      : { name: '', parentId: '', disabled: false };
  }

  save(): void {
    this.saving.set(true);
    const body = {
      name: this.form.name,
      disabled: this.form.disabled,
      parent: this.form.parentId ? { id: this.form.parentId } : null,
    };
    const isEdit = !!this.data.item;
    const obs = isEdit
      ? this.categoryService.update(this.data.item.id, body)
      : this.categoryService.create(body);

    obs.subscribe({
      next: () => this.dialogRef.close({ saved: true, isEdit }),
      error: () => this.dialogRef.close({ error: true }),
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
