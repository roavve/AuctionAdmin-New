import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatIconModule,
    MatListModule, MatButtonModule, MatMenuModule
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/auctions', label: 'Auctions', icon: 'gavel' },
    { path: '/companies', label: 'Companies', icon: 'business' },
    { path: '/users', label: 'Users', icon: 'people' },
    { path: '/projects', label: 'Projects', icon: 'folder' },
    { path: '/registrations', label: 'Registrations', icon: 'assignment' },
    { path: '/categories', label: 'Categories', icon: 'category' },
    { path: '/dictionary', label: 'Dictionary', icon: 'book' },
    { path: '/notifications', label: 'Notifications', icon: 'notifications' },
    { path: '/comments', label: 'Comments', icon: 'comment' },
    { path: '/text-templates', label: 'Templates', icon: 'description' },
    { path: '/audit', label: 'Audit Log', icon: 'history' },
    { path: '/monitor', label: 'Monitor', icon: 'monitor' },
  ];

  constructor(public auth: AuthService, private router: Router) {}

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
