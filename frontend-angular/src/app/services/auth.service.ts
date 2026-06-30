import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginResponse } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = `${environment.apiUrl}/auth`;

  readonly user = signal<{ email: string; role: string; firstName?: string; lastName?: string } | null>(
    this.loadUserFromStorage()
  );

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API}/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('email', res.email);
        localStorage.setItem('role', res.role);
        this.user.set({
          email: res.email,
          role: res.role,
          firstName: res.firstName,
          lastName: res.lastName
        });
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    this.user.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private loadUserFromStorage() {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');
    return token && email && role ? { email, role } : null;
  }
}
