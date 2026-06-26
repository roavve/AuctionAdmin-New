import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <h2 mat-dialog-title>Change Password</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full">
        <mat-label>New Password</mat-label>
        <input matInput type="password" [(ngModel)]="newPassword" />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="primary" (click)="dialogRef.close(newPassword)">Save</button>
    </mat-dialog-actions>
  `,
  styles: [`.full { width: 100%; }`]
})
export class ChangePasswordDialogComponent {
  newPassword = '';
  constructor(public dialogRef: MatDialogRef<ChangePasswordDialogComponent>) {}
}
