import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';

import { UserService } from '../../services/user.service';
import { ChangePasswordDialogComponent } from './change-password-dialog.component';

const ROLES = [
  { value: 'ROLE_ADMIN', label: 'Admin' },
  { value: 'ROLE_USER', label: 'User' },
  { value: 'ROLE_VIEWER', label: 'Viewer (Monitoring)' },
];

const EMPTY_FORM = {
  firstName: '', lastName: '', email: '', password: '',
  role: 'ROLE_USER', internal: false, external: true,
  contactEmail: '', contactPhone: '', contactMobile: '', contactPosition: '',
};

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatSlideToggleModule, MatProgressSpinnerModule,
  ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.css',
})
export class UserDetailComponent implements OnInit {
  id: string | null = null;
  isNew = false;

  user = signal<any>(null);
  loading = signal(false);
  error = signal('');
  actionMsg = signal('');
  editing = signal(false);
  saving = signal(false);
  saveError = signal('');
  validationError = signal('');

  form: any = { ...EMPTY_FORM };
  roles = ROLES;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.isNew = !this.id || this.id === 'new';
    if (this.isNew) {
      this.editing.set(true);
      this.form = { ...EMPTY_FORM };
    } else {
      this.loading.set(true);
      this.load();
    }
  }

  load(): void {
    this.userService.getById(this.id!).subscribe({
      next: (u: any) => { this.user.set(u); this.loading.set(false); },
      error: () => { this.error.set('Failed to load user'); this.loading.set(false); },
    });
  }

  roleLabel(role: string): string {
    return this.roles.find(r => r.value === role)?.label ?? role;
  }

  startEdit(): void {
    const u = this.user();
    this.form = {
      firstName: u.firstName || '', lastName: u.lastName || '', email: u.email || '', password: '',
      role: u.role || 'ROLE_USER', internal: u.internal || false, external: u.external || false,
      contactEmail: u.contactEmail || '', contactPhone: u.contactPhone || '',
      contactMobile: u.contactMobile || '', contactPosition: u.contactPosition || '',
    };
    this.saveError.set('');
    this.validationError.set('');
    this.editing.set(true);
  }

  cancelEdit(): void {
    if (this.isNew) { this.router.navigate(['/users']); return; }
    this.editing.set(false);
    this.validationError.set('');
    this.saveError.set('');
  }

  validate(): string {
    const f = this.form;
    const missing: string[] = [];
    if (!f.firstName?.trim()) missing.push('First Name');
    if (!f.lastName?.trim()) missing.push('Last Name');
    if (!f.email?.trim()) missing.push('Email');
    if (this.isNew && !f.password?.trim()) missing.push('Password');
    if (!f.contactPosition?.trim()) missing.push('Contact Position');
    if (!f.contactEmail?.trim()) missing.push('Contact Email');
    if (!f.contactPhone?.trim()) missing.push('Contact Phone');
    if (!f.contactMobile?.trim()) missing.push('Contact Mobile');
    if (missing.length > 0) return 'Please fill in required fields: ' + missing.join(', ');
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(f.email)) return 'Please enter a valid email address';
    return '';
  }

  save(): void {
    const err = this.validate();
    if (err) { this.validationError.set(err); return; }
    this.validationError.set('');
    this.saving.set(true);
    this.saveError.set('');

    if (this.isNew) {
      this.userService.create(this.form).subscribe({
        next: (res: any) => { this.saving.set(false); this.router.navigate(['/users', res.id]); },
        error: (e: any) => { this.saveError.set(e.error?.error || e.message || 'Save failed'); this.saving.set(false); },
      });
    } else {
      this.userService.update(this.id!, this.form).subscribe({
        next: () => {
          this.saving.set(false);
          this.editing.set(false);
          this.load();
          this.actionMsg.set('User saved successfully');
        },
        error: (e: any) => { this.saveError.set(e.error?.error || e.message || 'Save failed'); this.saving.set(false); },
      });
    }
  }

  handleAction(action: 'lock' | 'unlock' | 'cancel'): void {
    const obs = action === 'lock' ? this.userService.lock(this.id!)
      : action === 'unlock' ? this.userService.unlock(this.id!)
        : this.userService.cancel(this.id!);
    obs.subscribe({
      next: () => { this.actionMsg.set('Action completed'); this.load(); },
      error: () => this.actionMsg.set('Action failed'),
    });
  }

  openPasswordDialog(): void {
    const ref = this.dialog.open(ChangePasswordDialogComponent, { width: '400px' });
    ref.afterClosed().subscribe((pw: string | undefined) => {
      if (pw) this.changePassword(pw);
    });
  }

  changePassword(pw: string): void {
    this.userService.changePassword(this.id!, pw).subscribe({
      next: () => this.actionMsg.set('Password changed successfully'),
      error: () => this.actionMsg.set('Password change failed'),
    });
  }

  fmt(d: any): string { return d ? new Date(d).toLocaleDateString() : '-'; }
  fmtTime(d: any): string { return d ? new Date(d).toLocaleString() : '-'; }
  back(): void { this.router.navigate(['/users']); }
}
