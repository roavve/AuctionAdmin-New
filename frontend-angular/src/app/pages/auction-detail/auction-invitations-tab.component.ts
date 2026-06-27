import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, themeQuartz } from 'ag-grid-community';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

import { AuctionService } from '../../services/auction.service';
import { CompanyService } from '../../services/company.service';
import { ChipCellRenderer } from '../../shared/ag-grid/chip-cell.renderer';
import { InviteCompaniesDialogComponent } from './invite-companies-dialog.component';

@Component({
  selector: 'app-invitation-actions',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    <div class="acts">
      <button mat-button color="warn" class="b" (click)="cancel()">Cancel</button>
      <button mat-button color="primary" class="b" (click)="close()">Close</button>
    </div>
  `,
  styles: [`.acts { display: flex; gap: 4px; } .b { min-width: 0; padding: 0 8px; line-height: 30px; font-size: 0.8125rem; }`]
})
export class InvitationActionsRenderer implements ICellRendererAngularComp {
  private params!: ICellRendererParams & { onCancel?: (r: any) => void; onClose?: (r: any) => void };
  agInit(p: any): void { this.params = p; }
  refresh(p: any): boolean { this.params = p; return true; }
  cancel(): void { this.params.onCancel?.(this.params.data); }
  close(): void { this.params.onClose?.(this.params.data); }
}

@Component({
  selector: 'app-auction-invites-tab',
  standalone: true,
  imports: [CommonModule, AgGridAngular, MatButtonModule, MatIconModule],
  template: `
    <div class="head">
      <div class="subtitle">Invitations ({{ rows().length }})</div>
      <button mat-raised-button color="primary" (click)="openInvite()">
        <mat-icon>add</mat-icon>
        Invite Companies
      </button>
    </div>
    @if (msg()) { <div class="alert-info">{{ msg() }}</div> }
    <ag-grid-angular class="grid" [theme]="theme" [rowData]="rows()" [columnDefs]="columnDefs"
      [domLayout]="'autoHeight'" [loading]="loading()" [suppressCellFocus]="true"></ag-grid-angular>
  `,
  styles: [`
    .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .subtitle { font-weight: 700; }
    .head mat-icon { margin-right: 4px; }
    .alert-info { margin-bottom: 16px; padding: 6px 16px; border-radius: 4px; background: #e5f6fd; color: #014361; font-size: .875rem; }
    .grid { width: 100%; }
  `]
})
export class AuctionInvitesTabComponent implements OnInit {
  @Input() auctionId!: string;
  rows = signal<any[]>([]);
  loading = signal(true);
  msg = signal('');
  theme = themeQuartz;

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'company', headerName: 'Company', flex: 1, minWidth: 150, valueFormatter: p => p.value?.companyName ?? '-' },
    { field: 'status', headerName: 'Status', width: 130, cellRenderer: ChipCellRenderer, cellRendererParams: { labelGetter: (v: any) => v?.name ?? '' } },
    { field: 'dateInvited', headerName: 'Invited', width: 120, valueFormatter: p => (p.value ? new Date(p.value).toLocaleDateString() : '-') },
    {
      field: 'actions', headerName: '', width: 160, sortable: false,
      cellRenderer: InvitationActionsRenderer,
      cellRendererParams: {
        onCancel: (row: any) => this.cancelInv(row.id),
        onClose: (row: any) => this.closeInv(row.id),
      },
    },
  ];

  constructor(
    private auctionService: AuctionService,
    private companyService: CompanyService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.auctionService.getInvitations(this.auctionId).subscribe({
      next: d => { this.rows.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  cancelInv(id: number | string): void { this.auctionService.cancelInvitation(id).subscribe({ next: () => this.load(), error: () => {} }); }
  closeInv(id: number | string): void { this.auctionService.closeInvitation(id).subscribe({ next: () => this.load(), error: () => {} }); }

  openInvite(): void {
    this.companyService.getAll().subscribe({
      next: companies => {
        const ref = this.dialog.open(InviteCompaniesDialogComponent, { data: { companies }, width: '700px', maxWidth: '90vw' });
        ref.afterClosed().subscribe((ids: number[] | undefined) => {
          if (ids && ids.length) {
            this.auctionService.inviteCompanies(this.auctionId, ids).subscribe({
              next: (d: any) => { this.msg.set(`${d.count} companies invited successfully`); this.load(); },
              error: () => this.msg.set('Failed to invite companies'),
            });
          }
        });
      },
      error: () => {},
    });
  }
}
