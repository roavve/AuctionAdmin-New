import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-answer-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule,
    MatButtonModule, MatFormFieldModule, MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>Answer Comment</h2>
    <mat-dialog-content>
      <p class="orig">Original: {{ data.comment?.commText }}</p>
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full">
        <mat-label>Your Answer</mat-label>
        <textarea matInput rows="4" [(ngModel)]="answerText"></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="!answerText" (click)="submit()">
        Submit Answer
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .orig { color: rgba(0, 0, 0, 0.6); font-size: 0.875rem; margin-bottom: 16px; }
    .full { width: 100%; }
  `]
})
export class AnswerDialogComponent {
  answerText = '';

  constructor(
    public dialogRef: MatDialogRef<AnswerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { comment: any },
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    this.dialogRef.close(this.answerText);
  }
}
