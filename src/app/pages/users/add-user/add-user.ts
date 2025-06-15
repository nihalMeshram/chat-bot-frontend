import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UsersService, UserRole } from '../users.service';

@Component({
  standalone: true,
  selector: 'app-add-user',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-user.html',
  styleUrl: './add-user.scss',
})
export class AddUser {
  form: FormGroup;

  roles = Object.values(UserRole);
  successMessage = '';
  errorMessages: string[] = [];

  constructor(private fb: FormBuilder, private usersService: UsersService) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.pattern(/\S+/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
      ]],
      role: ['', Validators.required],
    });
  }

  onSubmit() {
    this.successMessage = '';
    this.errorMessages = [];

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // const { password, ...user } = this.form.value;
    this.usersService.addUser(this.form.value).subscribe({
      next: (res) => {
        this.successMessage = `User "${res.fullName}" created successfully.`;
        this.form.reset();
      },
      error: (err) => {
        const msg = err?.error?.message;
        this.errorMessages = Array.isArray(msg) ? msg : [ msg || 'Failed to create user.' ];
      },
    });
  }
}
