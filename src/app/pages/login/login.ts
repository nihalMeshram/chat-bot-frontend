import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  form: FormGroup;
  errorMessages: string[] = [];
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private http: HttpClient,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    this.authService.isUserLoaded().then(() => {
      if (this.authService.isLoggedIn()) {
        this.router.navigate(['/home']);
      }
    });
  }

  async onSubmit() {
    this.errorMessages = [];
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    try {
      const res = await this.http
        .post<{ message: string }>(`${environment.apiUrl}/auth/login`, this.form.value, {
          withCredentials: true,
        })
        .toPromise();

      this.successMessage = res?.message || 'Login successful';

      // ✅ Wait for the current user to be fetched before navigating
      await this.authService.fetchCurrentUser();
      this.router.navigate(['/home']);

    } catch (err: any) {
      if (err instanceof HttpErrorResponse) {
        const data = err.error;
        this.errorMessages = Array.isArray(data?.message)
          ? data.message
          : [data?.message || 'Login failed'];
      } else {
        this.errorMessages = ['Something went wrong. Please try again.'];
      }
    }
  }
}
