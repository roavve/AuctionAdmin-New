import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-invite-companies-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatCheckboxModule],
  template: `
    <h2 mat-dialog-title class="dlg-title">
      Invite Companies
      <span class="subtitle">{{ selected().length }} selected</span>
    </h2>
    <mat-dialog-content class="dlg-content">
      <div class="list">
        @for (c of data.companies; track c.id) {
          <div class="row" (click)="toggle(c.id)">
            <mat-checkbox [checked]="selected().includes(c.id)" (click)="$event.preventDefault()"></mat-checkbox>
            <div>
              <div class="primary">{{ c.companyName }}</div>
              <div class="secondary">{{ c.taxId || '' }} | {{ c.contactEmail || '' }}</div>
            </div>
          </div>
        }
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="selected().length === 0" (click)="dialogRef.close(selected())">
        Invite {{ selected().length }} Companies
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dlg-title { display: flex; flex-direction: column; }
    .subtitle { font-size: 0.875rem; color: rgba(0,0,0,.6); font-weight: 400; }
    .dlg-content { border-top: 1px solid rgba(0,0,0,.12); border-bottom: 1px solid rgba(0,0,0,.12); }
    .list { max-height: 400px; overflow: auto; }
    .row { display: flex; align-items: center; gap: 8px; padding: 4px 8px; border-radius: 4px; cursor: pointer; }
    .row:hover { background: rgba(0,0,0,.04); }
    .primary { font-size: 0.875rem; }
    .secondary { font-size: 0.75rem; color: rgba(0,0,0,.6); }
  `]
})
export class InviteCompaniesDialogComponent {
  selected = signal<number[]>([]);

  constructor(
    public dialogRef: MatDialogRef<InviteCompaniesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { companies: any[] },
  ) {}

  toggle(id: number): void {
    this.selected.update(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }
}
