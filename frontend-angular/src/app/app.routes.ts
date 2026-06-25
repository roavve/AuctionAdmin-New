import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './core/layout/layout.component';
import { AuctionsComponent } from './pages/auctions/auctions.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'auctions', component: AuctionsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },
  { path: '**', redirectTo: '/login' }
];
