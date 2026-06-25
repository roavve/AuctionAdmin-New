import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatCardModule, MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = signal(false);
  error = signal('');

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.error.set('');

    const { email, password } = this.loginForm.value;
    this.auth.login(email, password).subscribe({
      next: () => {
        this.router.navigate(['/auctions']);
      },
      error: (err: HttpErrorResponse) => {
        const serverError = err.error?.error;
        if (err.status === 429) {
          this.error.set(serverError || 'Too many login attempts. Please try again in 15 minutes.');
        } else if (serverError) {
          this.error.set(serverError);
        } else {
          this.error.set('Invalid email or password');
        }
        this.loading.set(false);
      }
    });
  }
}
