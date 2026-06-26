import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, themeQuartz } from 'ag-grid-community';

import { CompanyService } from '../../services/company.service';
import { CategoryService } from '../../services/category.service';
import { DictionaryService } from '../../services/dictionary.service';
import { ChipCellRenderer } from '../../shared/ag-grid/chip-cell.renderer';
import { ButtonCellRenderer } from '../../shared/ag-grid/button-cell.renderer';
import { DownloadDeleteActionsCellRenderer } from '../../shared/ag-grid/download-delete-actions.renderer';
import { BidHistoryTabComponent } from './bid-history-tab.component';
import { ProjectStatsTabComponent } from './project-stats-tab.component';
import { AuctionInvitationsTabComponent } from '../auction-detail/auction-invitations-tab.component';
import { CompanyCategoriesTabComponent } from './company-categories-tab.component';

const SUCCESS = { bg: '#2e7d32', fg: '#ffffff' };
const DEFAULT = { bg: '#e0e0e0', fg: 'rgba(0, 0, 0, 0.87)' };
const FILES_API = 'http://localhost:8080/api/companies';

const EMPTY_FORM: any = {
  companyName: '', taxId: '', businessDesc: '',
  phisAddress: '', legalAddress: '', webSite: '',
  bankCode1: '', bankAccount1: '', note: '',
  vatPayer: false,
  contactEmail: '', contactPhone: '', contactMobile: '',
  contactName: '', contactSurname: '', contactPosition: '',
  type: null, category: null,
};

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, AgGridAngular,
    MatButtonModule, MatIconModule, MatTabsModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatSlideToggleModule, MatProgressSpinnerModule,
    BidHistoryTabComponent, ProjectStatsTabComponent, AuctionInvitationsTabComponent, CompanyCategoriesTabComponent,
  ],
  templateUrl: './company-detail.component.html',
  styleUrl: './company-detail.component.css',
})
export class CompanyDetailComponent implements OnInit {
  id: string | null = null;
  isNew = false;

  company = signal<any>(null);
  loading = signal(false);
  error = signal('');
  actionMsg = signal('');
  editing = signal(false);
  saving = signal(false);
  saveError = signal('');
  validationError = signal('');
  tab = signal(0);

  users = signal<any[]>([]);
  files = signal<any[]>([]);
  uploadingFile = signal(false);
  fileDescription = '';

  categories = signal<any[]>([]);
  companyTypes = signal<any[]>([]);

  form: any = { ...EMPTY_FORM };
  theme = themeQuartz;

  compareById = (a: any, b: any) => (a?.id ?? a) === (b?.id ?? b);

  userColumns: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'firstName', headerName: 'First Name', width: 130 },
    { field: 'lastName', headerName: 'Last Name', width: 130 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 150 },
    { field: 'role', headerName: 'Role', width: 130 },
    {
      field: 'active', headerName: 'Active', width: 90,
      cellRenderer: ChipCellRenderer,
      cellRendererParams: {
        labelGetter: (v: any) => (v ? 'Active' : 'Inactive'),
        colorGetter: (v: any) => (v ? SUCCESS : DEFAULT),
      },
    },
    {
      field: 'actions', headerName: '', width: 90, sortable: false,
      cellRenderer: ButtonCellRenderer,
      cellRendererParams: { label: 'View', onClick: (row: any) => this.router.navigate(['/users', row.id]) },
    },
  ];

  fileColumns: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'fileName', headerName: 'File Name', flex: 1, minWidth: 150 },
    { field: 'fileDescription', headerName: 'Description', width: 200 },
    { field: 'fileSize', headerName: 'Size (bytes)', width: 120 },
    { field: 'fileDate', headerName: 'Date', width: 160, valueFormatter: p => (p.value ? new Date(p.value).toLocaleString() : '-') },
    { field: 'fileUser', headerName: 'Uploaded By', width: 150 },
    {
      field: 'actions', headerName: '', width: 160, sortable: false,
      cellRenderer: DownloadDeleteActionsCellRenderer,
      cellRendererParams: {
        onDownload: (row: any) => this.downloadFile(`${FILES_API}/files/${row.id}/download`, row.fileName),
        onDelete: (row: any) => this.handleDeleteFile(row.id),
      },
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private companyService: CompanyService,
    private categoryService: CategoryService,
    private dictionaryService: DictionaryService,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.isNew = !this.id || this.id === 'new';
    this.loadCategories();
    this.loadCompanyTypes();
    if (this.isNew) {
      this.editing.set(true);
      this.form = { ...EMPTY_FORM };
    } else {
      this.loading.set(true);
      this.load();
    }
  }

  load(): void {
    this.companyService.getById(this.id!).subscribe({
      next: (c: any) => {
        this.company.set(c);
        this.loading.set(false);
        this.loadUsers();
        this.loadFiles();
      },
      error: () => { this.error.set('Failed to load company'); this.loading.set(false); },
    });
  }

  loadUsers(): void { this.companyService.getUsers(this.id!).subscribe({ next: u => this.users.set(u), error: () => {} }); }
  loadFiles(): void { this.companyService.getFiles(this.id!).subscribe({ next: f => this.files.set(f), error: () => {} }); }
  loadCategories(): void { this.categoryService.getAll().subscribe({ next: c => this.categories.set(c), error: () => {} }); }

  loadCompanyTypes(): void {
    this.dictionaryService.getItems().subscribe({
      next: items => this.companyTypes.set(items.filter(d => d.key?.startsWith('key.companyType'))),
      error: () => {},
    });
  }

  onTab(i: number): void { this.tab.set(i); }

  fmt(d: any): string { return d ? new Date(d).toLocaleDateString() : '-'; }
  contactName(c: any): string { return `${c?.contactName || ''} ${c?.contactSurname || ''}`.trim() || '-'; }

  startEdit(): void {
    this.form = { ...EMPTY_FORM, ...this.company() };
    this.saveError.set('');
    this.validationError.set('');
    this.editing.set(true);
  }

  cancelEdit(): void {
    if (this.isNew) { this.router.navigate(['/companies']); return; }
    this.editing.set(false);
    this.validationError.set('');
    this.saveError.set('');
  }

  validate(): string {
    const f = this.form;
    const missing: string[] = [];
    if (!f.companyName?.trim()) missing.push('Company Name');
    if (!f.type?.id) missing.push('Type');
    if (!f.businessDesc?.trim()) missing.push('Business Description');
    if (!f.contactEmail?.trim()) missing.push('Contact Email');
    if (missing.length > 0) return 'Please fill in required fields: ' + missing.join(', ');
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(f.contactEmail)) return 'Please enter a valid contact email address';
    return '';
  }

  save(): void {
    const err = this.validate();
    if (err) { this.validationError.set(err); return; }
    this.validationError.set('');
    this.saving.set(true);
    this.saveError.set('');

    if (this.isNew) {
      this.companyService.create(this.form).subscribe({
        next: (res: any) => { this.saving.set(false); this.router.navigate(['/companies', res.id]); },
        error: (e: any) => { this.saveError.set(e.error?.error || e.message || 'Save failed'); this.saving.set(false); },
      });
    } else {
      this.companyService.update(this.id!, this.form).subscribe({
        next: () => { this.saving.set(false); this.editing.set(false); this.load(); this.actionMsg.set('Company saved successfully'); },
        error: (e: any) => { this.saveError.set(e.error?.error || e.message || 'Save failed'); this.saving.set(false); },
      });
    }
  }

  handleCancel(): void {
    this.companyService.cancel(this.id!).subscribe({
      next: () => { this.actionMsg.set('Company cancelled'); this.load(); },
      error: () => this.actionMsg.set('Action failed'),
    });
  }

  handleInvite(): void {
    this.companyService.invite(this.id!).subscribe({
      next: () => { this.actionMsg.set('Company invited successfully - user account created and credentials sent'); this.load(); },
      error: () => this.actionMsg.set('Invite failed'),
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploadingFile.set(true);
    const formData = new FormData();
    formData.append('file', file);
    if (this.fileDescription) formData.append('description', this.fileDescription);
    this.companyService.uploadFile(this.id!, formData).subscribe({
      next: () => { this.actionMsg.set(`File "${file.name}" uploaded successfully`); this.loadFiles(); this.uploadingFile.set(false); input.value = ''; },
      error: () => { this.actionMsg.set('Upload failed'); this.uploadingFile.set(false); input.value = ''; },
    });
  }

  handleDeleteFile(fileId: number | string): void {
    this.companyService.deleteFile(fileId).subscribe({ next: () => this.loadFiles(), error: () => {} });
  }

  downloadFile(url: string, fileName: string): void {
    this.companyService.download(url).subscribe({
      next: blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName || 'download';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(blobUrl);
      },
      error: () => this.actionMsg.set('Download failed'),
    });
  }

  back(): void { this.router.navigate(['/companies']); }
}
