import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

import { AuctionService } from '../../services/auction.service';
import { CompanyService } from '../../services/company.service';
import { UserService } from '../../services/user.service';
import { ProjectService } from '../../services/project.service';
import { RegistrationService } from '../../services/registration.service';

interface StatCard {
  title: string;
  value: number | null;
  color: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, MatIconModule, MatProgressSpinnerModule,
    MatListModule, MatChipsModule, MatDividerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  stats = signal<StatCard[]>([
    { title: 'Active Auctions', value: null, color: '#4caf50', icon: 'gavel', route: '/auctions' },
    { title: 'Draft Auctions', value: null, color: '#9e9e9e', icon: 'gavel', route: '/auctions' },
    { title: 'Pending Registrations', value: null, color: '#ff9800', icon: 'assignment', route: '/registrations' },
    { title: 'Total Companies', value: null, color: '#2196f3', icon: 'business', route: '/companies' },
    { title: 'Total Users', value: null, color: '#9c27b0', icon: 'people', route: '/users' },
    { title: 'Total Projects', value: null, color: '#00bcd4', icon: 'folder', route: '/projects' },
  ]);

  recentAuctions = signal<any[]>([]);
  recentRegistrations = signal<any[]>([]);
  loading = signal(true);

  readonly STATUS_COLORS: Record<string, string> = {
    'key.auctionStatus.draft': '#9e9e9e',
    'key.auctionStatus.active': '#4caf50',
    'key.auctionStatus.planned': '#2196f3',
    'key.auctionStatus.completed': '#9c27b0',
    'key.auctionStatus.cancelled': '#f44336',
  };

  constructor(
    private router: Router,
    private auctionService: AuctionService,
    private companyService: CompanyService,
    private userService: UserService,
    private projectService: ProjectService,
    private registrationService: RegistrationService,
  ) {}

  ngOnInit(): void {
    forkJoin({
      auctions: this.auctionService.search({ size: 100 }),
      companies: this.companyService.getAll(),
      users: this.userService.search({ size: 100 }),
      projects: this.projectService.getAll(),
      registrations: this.registrationService.getByStatus('new', 0, 100),
    }).subscribe({
      next: (res: any) => {
        const auctions = res.auctions.content || [];
        const active = auctions.filter((a: any) => a.status?.key === 'key.auctionStatus.active').length;
        const draft = auctions.filter((a: any) => a.status?.key === 'key.auctionStatus.draft').length;

        this.stats.set([
          { title: 'Active Auctions', value: active, color: '#4caf50', icon: 'gavel', route: '/auctions' },
          { title: 'Draft Auctions', value: draft, color: '#9e9e9e', icon: 'gavel', route: '/auctions' },
          { title: 'Pending Registrations', value: res.registrations.totalElements || 0, color: '#ff9800', icon: 'assignment', route: '/registrations' },
          { title: 'Total Companies', value: Array.isArray(res.companies) ? res.companies.length : 0, color: '#2196f3', icon: 'business', route: '/companies' },
          { title: 'Total Users', value: res.users.totalElements || 0, color: '#9c27b0', icon: 'people', route: '/users' },
          { title: 'Total Projects', value: Array.isArray(res.projects) ? res.projects.length : 0, color: '#00bcd4', icon: 'folder', route: '/projects' },
        ]);

        this.recentAuctions.set(auctions.slice(0, 8));
        this.recentRegistrations.set((res.registrations.content || []).slice(0, 5));
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Dashboard load error', err);
        this.loading.set(false);
      }
    });
  }

  go(route: string): void {
    this.router.navigate([route]);
  }

  goAuction(id: number): void {
    this.router.navigate(['/auctions', id]);
  }
}
