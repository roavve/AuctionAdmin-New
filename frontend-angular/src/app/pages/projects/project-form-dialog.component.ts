import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-project-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <h2 mat-dialog-title>{{ data.project?.id ? 'Edit Project' : 'New Project' }}</h2>
    <mat-dialog-content>
      @if (saveError()) {
        <div class="alert-error">{{ saveError() }}</div>
      }
      <mat-form-field appearance="outline" class="full">
        <mat-label>Project Name</mat-label>
        <input matInput [(ngModel)]="form.name" required />
      </mat-form-field>
      <mat-form-field appearance="outline" class="full">
        <mat-label>Project Sum</mat-label>
        <input matInput type="number" [(ngModel)]="form.projectSum" />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button color="primary" [disabled]="saving()" (click)="save()">
        {{ saving() ? 'Saving...' : 'Save' }}
      </button>
      <button mat-button (click)="close()">Cancel</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full { width: 100%; display: block; }
    .alert-error { margin-bottom: 16px; padding: 6px 16px; border-radius: 4px; background: #fdeded; color: #5f2120; font-size: .875rem; }
  `]
})
export class ProjectFormDialogComponent {
  form: any;
  saving = signal(false);
  saveError = signal('');

  constructor(
    public dialogRef: MatDialogRef<ProjectFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { project: any | null },
    private projectService: ProjectService,
  ) {
    this.form = data.project ? { ...data.project } : { name: '', projectSum: '' };
  }

  save(): void {
    this.saving.set(true);
    this.saveError.set('');
    const isEdit = !!this.data.project?.id;
    const obs = isEdit
      ? this.projectService.update(this.data.project.id, this.form)
      : this.projectService.create(this.form);

    obs.subscribe({
      next: () => this.dialogRef.close({ saved: true, isEdit }),
      error: (e: any) => {
        this.saveError.set(e.error?.error || e.message || 'Save failed');
        this.saving.set(false);
      },
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
