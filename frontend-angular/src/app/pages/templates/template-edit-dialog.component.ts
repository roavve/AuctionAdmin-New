import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { TemplateService } from '../../services/template.service';

@Component({
  selector: 'app-template-edit-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <h2 mat-dialog-title class="dlg-title">
      Edit Template: {{ data.template?.name }}
      <span class="subtitle">{{ data.template?.tkey }}</span>
    </h2>
    <mat-dialog-content class="dlg-content">
      <div class="vars">{{ variablesHint }}</div>

      <mat-form-field appearance="outline" class="full">
        <mat-label>Email Subject</mat-label>
        <input matInput [(ngModel)]="form.subject" />
      </mat-form-field>

      <div class="divider-chip">
        <span class="dc-line"></span>
        <span class="dc-chip">Email Body</span>
        <span class="dc-line"></span>
      </div>

      <mat-form-field appearance="outline" class="full">
        <mat-label>Email Body (HTML)</mat-label>
        <textarea matInput rows="6" class="mono" [(ngModel)]="form.emailBody"></textarea>
        <mat-hint>{{ emailHint }}</mat-hint>
      </mat-form-field>

      <div class="divider-chip">
        <span class="dc-line"></span>
        <span class="dc-chip primary">SMS Body</span>
        <span class="dc-line"></span>
      </div>

      <mat-form-field appearance="outline" class="full">
        <mat-label>SMS Body</mat-label>
        <textarea matInput rows="3" [(ngModel)]="form.smsBody"></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="saving()" (click)="save()">
        {{ saving() ? 'Saving...' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dlg-title { display: flex; flex-direction: column; }
    .subtitle { font-size: 0.875rem; color: rgba(0,0,0,.6); font-weight: 400; }
    .dlg-content { border-top: 1px solid rgba(0,0,0,.12); border-bottom: 1px solid rgba(0,0,0,.12); }
    .vars { font-size: 0.875rem; color: rgba(0,0,0,.6); margin-bottom: 16px; }
    .full { width: 100%; display: block; margin-bottom: 16px; }
    .mono { font-family: monospace; }
    .divider-chip { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
    .dc-line { flex: 1; height: 1px; background: rgba(0,0,0,.12); }
    .dc-chip { display: inline-flex; align-items: center; height: 24px; padding: 0 10px; border-radius: 12px; font-size: 0.8125rem; background: #e0e0e0; color: rgba(0,0,0,.87); }
    .dc-chip.primary { background: #1976d2; color: #fff; }
  `]
})
export class TemplateEditDialogComponent {
  form: { subject: string; emailBody: string; smsBody: string };
  saving = signal(false);

  variablesHint = 'Available variables: {auctionName} {email} {password} {bidValue} {companyName}';
  emailHint = 'Supports HTML tags like <b>, <p>, <br>';

  constructor(
    public dialogRef: MatDialogRef<TemplateEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { template: any },
    private templateService: TemplateService,
  ) {
    this.form = {
      subject: data.template?.subject || '',
      emailBody: data.template?.emailBody || '',
      smsBody: data.template?.smsBody || '',
    };
  }

  save(): void {
    this.saving.set(true);
    this.templateService.update(this.data.template.id, { ...this.data.template, ...this.form }).subscribe({
      next: () => this.dialogRef.close({ saved: true }),
      error: () => this.dialogRef.close({ error: true }),
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
