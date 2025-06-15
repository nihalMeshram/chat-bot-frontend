import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UsersService, UserRole } from '../users.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-edit-user',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-user.html',
  styleUrl: './edit-user.scss'
})
export class EditUser implements OnInit {
  userForm!: FormGroup;
  userId!: string;
  createdAt!: Date;
  updatedAt!: Date;
  userRoles = Object.values(UserRole);
  errorMessages: string[] = [];
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id')!;
    this.usersService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.createdAt = new Date(user.createdAt);
        this.updatedAt = new Date(user.updatedAt);
        this.userForm = this.fb.group({
          fullName: [user.fullName, [Validators.required, Validators.minLength(2)]],
          email: [user.email, [Validators.required, Validators.email]],
          role: [user.role, Validators.required],
        });
      },
      error: () => {
        this.errorMessages = ['Failed to load user. The user may have been archived or does not exist.'];
      }
    });
  }

  onSubmit() {
    if (this.userForm.invalid) return;

    this.usersService.updateUser(this.userId, this.userForm.value).pipe(
      catchError((err) => {
        const msg = err?.error?.message;
        this.errorMessages = Array.isArray(msg) ? msg : [msg || 'Failed to update user.'];
        return of(null);
      })
    ).subscribe((res) => {
      if (res) {
        this.successMessage = 'User updated successfully.';
        this.errorMessages = [];
        this.updatedAt = new Date(res.updatedAt);
      }
    });
  }
}
