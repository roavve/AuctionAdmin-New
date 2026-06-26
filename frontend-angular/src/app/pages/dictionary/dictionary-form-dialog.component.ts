import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { DictionaryService } from '../../services/dictionary.service';

@Component({
  selector: 'app-dictionary-form-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSlideToggleModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.item ? 'Edit Dictionary Item' : 'New Dictionary Item' }}</h2>
    <mat-dialog-content>
      <div class="alert-warning">
        Be careful editing dictionary keys — they are used throughout the system.
      </div>
      <mat-form-field appearance="outline" class="full">
        <mat-label>Key</mat-label>
        <input matInput [(ngModel)]="form.key" required />
      </mat-form-field>
      <mat-form-field appearance="outline" class="full">
        <mat-label>Name (EN)</mat-label>
        <input matInput [(ngModel)]="form.name" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="full">
        <mat-label>Name (GE)</mat-label>
        <input matInput [(ngModel)]="form.nameGE" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="full">
        <mat-label>Sort Order</mat-label>
        <input matInput type="number" [(ngModel)]="form.sortOrder" />
      </mat-form-field>
      <mat-slide-toggle [(ngModel)]="form.disabled">Disabled</mat-slide-toggle>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="saving() || !form.key" (click)="save()">
        {{ saving() ? 'Saving...' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full { width: 100%; display: block; margin-bottom: 16px; }
    .alert-warning {
      margin-bottom: 16px;
      padding: 6px 16px;
      border-radius: 4px;
      background: #fff4e5;
      color: #663c00;
      font-size: .875rem;
    }
  `]
})
export class DictionaryFormDialogComponent {
  form: { key: string; name: string; nameGE: string; sortOrder: any; disabled: boolean };
  saving = signal(false);

  constructor(
    public dialogRef: MatDialogRef<DictionaryFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { item: any | null },
    private dictionaryService: DictionaryService,
  ) {
    this.form = data.item
      ? {
        key: data.item.key || '',
        name: data.item.name || '',
        nameGE: data.item.nameGE || '',
        sortOrder: data.item.sortOrder || '',
        disabled: data.item.disabled || false,
      }
      : { key: '', name: '', nameGE: '', sortOrder: '', disabled: false };
  }

  save(): void {
    this.saving.set(true);
    const body = {
      key: this.form.key,
      name: this.form.name,
      nameGE: this.form.nameGE,
      sortOrder: this.form.sortOrder ? parseInt(this.form.sortOrder, 10) : null,
      disabled: this.form.disabled,
    };
    const isEdit = !!this.data.item;
    const obs = isEdit
      ? this.dictionaryService.update(this.data.item.id, body)
      : this.dictionaryService.create(body);

    obs.subscribe({
      next: () => this.dialogRef.close({ saved: true, isEdit }),
      error: () => this.dialogRef.close({ error: true }),
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
