import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class Register {
  form: FormGroup;
  errorMessages: string[] = [];
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient // ✅ Inject HttpClient
  ) {
    this.form = this.fb.group(
      {
        fullName: ['', [Validators.required, Validators.pattern(/\S+/)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
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
        .post<{ message: string }>(`${environment.apiUrl}/auth/register`, this.form.value)
        .toPromise();

      this.successMessage = 'Registration successful. You can now ';
      this.form.reset();
    } catch (err: any) {
      if (err instanceof HttpErrorResponse) {
        const data = err.error;
        this.errorMessages = Array.isArray(data?.message)
          ? data.message
          : [data?.message || 'Registration failed'];
      } else {
        this.errorMessages = ['Something went wrong. Please try again.'];
      }
    }
  }
}
