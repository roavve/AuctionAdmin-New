import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './core/layout/layout.component';
import { AuctionsComponent } from './pages/auctions/auctions.component';
import { AuctionDetailComponent } from './pages/auction-detail/auction-detail.component';
import { CommentsComponent } from './pages/comments/comments.component';
import { MonitorComponent } from './pages/monitor/monitor.component';
import { CompaniesComponent } from './pages/companies/companies.component';
import { CompanyDetailComponent } from './pages/company-detail/company-detail.component';
import { UsersComponent } from './pages/users/users.component';
import { UserDetailComponent } from './pages/user-detail/user-detail.component';
import { RegistrationsComponent } from './pages/registrations/registrations.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { DictionaryComponent } from './pages/dictionary/dictionary.component';
import { AuditLogComponent } from './pages/audit-log/audit-log.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { TemplatesComponent } from './pages/templates/templates.component';
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
      { path: 'auctions/:id', component: AuctionDetailComponent },
      { path: 'comments', component: CommentsComponent },
      { path: 'monitor', component: MonitorComponent },
      { path: 'companies', component: CompaniesComponent },
      { path: 'companies/:id', component: CompanyDetailComponent },
      { path: 'users', component: UsersComponent },
      { path: 'users/:id', component: UserDetailComponent },
      { path: 'registrations', component: RegistrationsComponent },
      { path: 'projects', component: ProjectsComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'dictionary', component: DictionaryComponent },
      { path: 'audit', component: AuditLogComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'templates', component: TemplatesComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },
  { path: '**', redirectTo: '/login' }
];
