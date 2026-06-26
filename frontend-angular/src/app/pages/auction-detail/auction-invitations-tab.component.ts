import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, themeQuartz } from 'ag-grid-community';

import { CompanyService } from '../../services/company.service';
import { ChipCellRenderer } from '../../shared/ag-grid/chip-cell.renderer';
import { ButtonCellRenderer } from '../../shared/ag-grid/button-cell.renderer';

@Component({
  selector: 'app-auction-invitations-tab',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  template: `
    <div class="subtitle">Auction Invitations ({{ rows().length }})</div>
    <ag-grid-angular class="grid" [theme]="theme" [rowData]="rows()" [columnDefs]="columnDefs"
      [domLayout]="'autoHeight'" [loading]="loading()" [suppressCellFocus]="true"></ag-grid-angular>
  `,
  styles: [`.subtitle { font-weight: 700; margin-bottom: 16px; } .grid { width: 100%; }`]
})
export class AuctionInvitationsTabComponent implements OnInit {
  @Input() companyId!: string;
  rows = signal<any[]>([]);
  loading = signal(true);
  theme = themeQuartz;

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'auction', headerName: 'Auction', flex: 1, minWidth: 150,
      cellRenderer: ButtonCellRenderer,
      cellRendererParams: {
        labelGetter: (row: any) => row.auction?.name ?? '-',
        onClick: (row: any) => this.router.navigate(['/auctions', row.auction?.id]),
      },
    },
    {
      field: 'status', headerName: 'Status', width: 130,
      cellRenderer: ChipCellRenderer,
      cellRendererParams: { labelGetter: (v: any) => v?.name ?? '' },
    },
    { field: 'dateInvited', headerName: 'Date Invited', width: 160, valueFormatter: p => (p.value ? new Date(p.value).toLocaleDateString() : '-') },
    { field: 'dateAccepted', headerName: 'Date Accepted', width: 160, valueFormatter: p => (p.value ? new Date(p.value).toLocaleDateString() : '-') },
  ];

  constructor(private companyService: CompanyService, private router: Router) {}

  ngOnInit(): void {
    this.companyService.getInvitations(this.companyId).subscribe({
      next: d => { this.rows.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
