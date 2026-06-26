import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, themeQuartz } from 'ag-grid-community';

import { ProjectService } from '../../services/project.service';
import { AuctionService } from '../../services/auction.service';
import { CompanyService } from '../../services/company.service';
import { ChipCellRenderer } from '../../shared/ag-grid/chip-cell.renderer';
import { ProjectActionsCellRenderer } from './project-actions-cell.renderer';
import { ProjectFormDialogComponent } from './project-form-dialog.component';
import { ProjectAuctionsDialogComponent } from './project-auctions-dialog.component';
import { ProjectInviteDialogComponent } from './project-invite-dialog.component';

const WARNING = { bg: '#d32f2f', fg: '#ffffff' };

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, AgGridAngular, MatButtonModule, MatIconModule, MatPaginatorModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
})
export class ProjectsComponent implements OnInit {
  allRows = signal<any[]>([]);
  rows = signal<any[]>([]);
  loading = signal(true);
  error = signal('');
  actionMsg = signal('');
  page = signal(0);
  pageSize = signal(20);

  theme = themeQuartz;

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Project Name', flex: 1, minWidth: 150 },
    {
      field: 'status', headerName: 'Status', width: 130,
      cellRenderer: ChipCellRenderer,
      cellRendererParams: { labelGetter: (v: any) => v?.name ?? '' },
    },
    {
      field: 'projectSum', headerName: 'Sum', width: 130,
      valueFormatter: p => (p.value ? Number(p.value).toLocaleString() : '-'),
    },
    {
      field: 'disabled', headerName: 'Disabled', width: 100,
      cellRenderer: ChipCellRenderer,
      cellRendererParams: {
        visible: (v: any) => !!v,
        labelGetter: () => 'Disabled',
        colorGetter: () => WARNING,
      },
    },
    {
      field: 'actions', headerName: '', width: 280, sortable: false,
      cellRenderer: ProjectActionsCellRenderer,
      cellRendererParams: {
        onAuctions: (row: any) => this.viewAuctions(row),
        onInvite: (row: any) => this.inviteToProject(row),
        onEdit: (row: any) => this.openForm(row),
        onDelete: (row: any) => this.handleDelete(row.id),
      },
    },
  ];

  constructor(
    private projectService: ProjectService,
    private auctionService: AuctionService,
    private companyService: CompanyService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.projectService.getAll().subscribe({
      next: (data: any[]) => {
        this.allRows.set(data);
        this.applyPage();
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load projects');
        this.loading.set(false);
      },
    });
  }

  applyPage(): void {
    const start = this.page() * this.pageSize();
    this.rows.set(this.allRows().slice(start, start + this.pageSize()));
  }

  onPage(e: PageEvent): void {
    this.page.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
    this.applyPage();
  }

  openForm(project: any | null): void {
    const ref = this.dialog.open(ProjectFormDialogComponent, { data: { project }, width: '500px' });
    ref.afterClosed().subscribe((r: any) => {
      if (r?.saved) {
        this.actionMsg.set(r.isEdit ? 'Project updated' : 'Project created');
        this.load();
      }
    });
  }

  handleDelete(id: number | string): void {
    if (!window.confirm('Delete this project?')) return;
    this.projectService.delete(id).subscribe({
      next: () => { this.actionMsg.set('Project deleted'); this.load(); },
      error: () => this.actionMsg.set('Delete failed'),
    });
  }

  viewAuctions(project: any): void {
    this.auctionService.search({ projectId: project.id, size: 100 }).subscribe({
      next: (res: any) => {
        this.dialog.open(ProjectAuctionsDialogComponent, {
          data: { project, auctions: res.content || [] },
          width: '1100px',
          maxWidth: '90vw',
        });
      },
      error: () => {
        this.dialog.open(ProjectAuctionsDialogComponent, {
          data: { project, auctions: [] },
          width: '1100px',
          maxWidth: '90vw',
        });
      },
    });
  }

  inviteToProject(project: any): void {
    this.companyService.getAll().subscribe({
      next: (companies: any[]) => this.openInvite(project, companies),
      error: () => this.openInvite(project, []),
    });
  }

  openInvite(project: any, companies: any[]): void {
    const ref = this.dialog.open(ProjectInviteDialogComponent, {
      data: { project, companies },
      width: '700px',
      maxWidth: '90vw',
    });
    ref.afterClosed().subscribe((r: any) => {
      if (r?.count != null) this.actionMsg.set(`${r.count} invitations created across all active auctions`);
      else if (r?.error) this.actionMsg.set('Invite failed');
    });
  }
}
