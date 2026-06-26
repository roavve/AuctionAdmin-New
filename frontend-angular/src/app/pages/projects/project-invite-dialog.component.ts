import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-project-invite-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatCheckboxModule],
  template: `
    <h2 mat-dialog-title class="dlg-title">
      Invite Companies to All Active Auctions in: {{ data.project?.name }}
      <span class="subtitle">{{ selected().length }} selected</span>
    </h2>
    <mat-dialog-content class="dlg-content">
      <div class="list">
        @for (c of data.companies; track c.id) {
          <div class="row" (click)="toggle(c.id)">
            <mat-checkbox [checked]="selected().includes(c.id)" (click)="$event.preventDefault()"></mat-checkbox>
            <div class="row-text">
              <div class="row-primary">{{ c.companyName }}</div>
              <div class="row-secondary">{{ c.taxId || '' }} | {{ c.contactEmail || '' }}</div>
            </div>
          </div>
        }
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="selected().length === 0 || inviteLoading()" (click)="invite()">
        {{ inviteLoading() ? 'Inviting...' : 'Invite ' + selected().length + ' Companies' }}
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
    .row-primary { font-size: 0.875rem; }
    .row-secondary { font-size: 0.75rem; color: rgba(0,0,0,.6); }
  `]
})
export class ProjectInviteDialogComponent {
  selected = signal<number[]>([]);
  inviteLoading = signal(false);

  constructor(
    public dialogRef: MatDialogRef<ProjectInviteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { project: any; companies: any[] },
    private projectService: ProjectService,
  ) {}

  toggle(id: number): void {
    this.selected.update(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  invite(): void {
    this.inviteLoading.set(true);
    this.projectService.inviteCompanies(this.data.project.id, this.selected()).subscribe({
      next: (d: any) => this.dialogRef.close({ count: d.count }),
      error: () => this.dialogRef.close({ error: true }),
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
