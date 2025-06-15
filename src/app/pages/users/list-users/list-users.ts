import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UsersService, User } from '../users.service'; // Adjust path if needed

@Component({
  standalone: true,
  selector: 'app-list-users',
  imports: [CommonModule, RouterModule],
  templateUrl: './list-users.html',
  styleUrls: ['./list-users.scss'],
})
export class ListUsers implements OnInit {
  users: User[] = [];
  loading = true;
  error: string | null = null;

  constructor(private usersService: UsersService) { }

  ngOnInit() {
    this.usersService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load users';
        console.error(err);
        this.loading = false;
      },
    });
  }

  onEdit(user: User) {
    // navigate to edit or open modal
    console.log('Edit', user);
  }

  onDelete(user: User) {
    this.usersService.deleteUser(user.id).subscribe({
      next: () => {
        // Set deletedAt to current date
        const target = this.users.find(u => u.id === user.id);
        if (target) {
          target.deletedAt = new Date(); // Set current date
        }
      },
      error: (err) => {
        const msg = err?.error?.message;
        this.error = Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to delete user';
      },
    });
  }

  onRestore(user: User) {
    this.usersService.restoreUser(user.id).subscribe({
      next: () => {
        // Set deletedAt to null
        const target = this.users.find(u => u.id === user.id);
        if (target) {
          target.deletedAt = null;
        }
      },
      error: (err) => {
        const msg = err?.error?.message;
        this.error = Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to restore user.';
      },
    });
  }
}
