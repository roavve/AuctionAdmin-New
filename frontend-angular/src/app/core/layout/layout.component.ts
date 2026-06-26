import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, RouterLink, RouterLinkActive, RouterOutlet,
    MatToolbarModule, MatIconModule, MatListModule, MatButtonModule,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {
  // Order, labels, icons and paths mirror React Layout.js exactly.
  navItems = [
    { path: '/dashboard',     label: 'Dashboard',     icon: 'dashboard' },
    { path: '/auctions',      label: 'Auctions',      icon: 'gavel' },
    { path: '/comments',      label: 'Comments',      icon: 'comment' },
    { path: '/monitor',       label: 'Monitor',       icon: 'monitor' },
    { path: '/companies',     label: 'Companies',     icon: 'business' },
    { path: '/users',         label: 'Users',         icon: 'people' },
    { path: '/registrations', label: 'Registrations', icon: 'app_registration' },
    { path: '/projects',      label: 'Projects',      icon: 'folder' },
    { path: '/categories',    label: 'Categories',    icon: 'category' },
    { path: '/dictionary',    label: 'Dictionary',    icon: 'menu_book' },
    { path: '/audit',         label: 'Audit Log',     icon: 'history' },
    { path: '/notifications', label: 'Notifications', icon: 'notifications' },
    { path: '/templates',     label: 'Templates',     icon: 'article' },
  ];

  constructor(public auth: AuthService, private router: Router) {}

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
