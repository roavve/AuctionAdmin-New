import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, themeQuartz } from 'ag-grid-community';

import { CommentService } from '../../services/comment.service';
import { ChipCellRenderer } from '../../shared/ag-grid/chip-cell.renderer';
import { ButtonCellRenderer } from '../../shared/ag-grid/button-cell.renderer';
import { CommentTextCellRenderer } from './comment-text-cell.renderer';
import { CommentActionsCellRenderer } from './comment-actions-cell.renderer';
import { AnswerDialogComponent } from './answer-dialog.component';

const TAB_KEYS = ['new', 'answered', 'approved', 'cancelled'];

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, AgGridAngular, MatTabsModule, MatPaginatorModule],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.css',
})
export class CommentsComponent implements OnInit {
  tab = signal(0);
  rows = signal<any[]>([]);
  allRows = signal<any[]>([]);
  loading = signal(true);
  total = signal(0);
  page = signal(0);
  pageSize = signal(20);
  error = signal('');
  actionMsg = signal('');

  theme = themeQuartz;

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'auction', headerName: 'Auction', width: 180,
      cellRenderer: ButtonCellRenderer,
      cellRendererParams: {
        labelGetter: (row: any) => row.auction?.name ?? '-',
        onClick: (row: any) => this.router.navigate(['/auctions', row.auction?.id]),
      },
    },
    {
      field: 'commCreated', headerName: 'Date', width: 160,
      valueFormatter: p => (p.value ? new Date(p.value).toLocaleString() : '-'),
    },
    {
      field: 'user', headerName: 'Company', width: 160,
      valueFormatter: p => p.value?.company?.companyName ?? p.value?.email ?? '-',
    },
    {
      field: 'commText', headerName: 'Question / Answer', flex: 1, minWidth: 220,
      cellRenderer: CommentTextCellRenderer,
      cellRendererParams: { getReply: (row: any) => this.findReply(row) },
    },
    {
      field: 'status', headerName: 'Status', width: 110,
      cellRenderer: ChipCellRenderer,
      cellRendererParams: { labelGetter: (v: any) => v?.name ?? '' },
    },
    {
      field: 'actions', headerName: '', width: 220, sortable: false,
      cellRenderer: CommentActionsCellRenderer,
      cellRendererParams: {
        onApprove: (row: any) => this.handleApprove(row.id),
        onAnswer: (row: any) => this.openAnswer(row),
        onCancel: (row: any) => this.handleCancel(row.id),
      },
    },
  ];

  constructor(
    private router: Router,
    private commentService: CommentService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.commentService.getByStatus(TAB_KEYS[this.tab()], this.page(), this.pageSize()).subscribe({
      next: (data: any) => {
        const content = data.content || [];
        this.allRows.set(content);
        const nonAdmin = content.filter((r: any) => !r.admin);
        this.rows.set(nonAdmin);
        this.total.set(nonAdmin.length);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load comments');
        this.loading.set(false);
      },
    });
  }

  findReply(row: any): string | null {
    if (row.answerToKey !== null) return null;
    const reply = this.allRows().find(r => r.answerToKey === row.recordKey);
    return reply?.commText ?? null;
  }

  onTab(index: number): void {
    this.tab.set(index);
    this.page.set(0);
    this.load();
  }

  onPage(e: PageEvent): void {
    this.page.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
    this.load();
  }

  handleCancel(id: number | string): void {
    this.commentService.cancel(id).subscribe({
      next: () => { this.actionMsg.set('Comment cancelled'); this.load(); },
      error: () => this.actionMsg.set('Action failed'),
    });
  }

  handleApprove(id: number | string): void {
    this.commentService.approve(id).subscribe({
      next: () => { this.actionMsg.set('Comment approved'); this.load(); },
      error: () => this.actionMsg.set('Action failed'),
    });
  }

  openAnswer(row: any): void {
    const ref = this.dialog.open(AnswerDialogComponent, {
      data: { comment: row },
      width: '600px',
    });
    ref.afterClosed().subscribe((text: string | undefined) => {
      if (text) this.submitAnswer(row, text);
    });
  }

  submitAnswer(row: any, text: string): void {
    this.commentService.answer(row.id, text).subscribe({
      next: () => { this.actionMsg.set('Comment answered'); this.load(); },
      error: () => this.actionMsg.set('Answer failed'),
    });
  }
}
