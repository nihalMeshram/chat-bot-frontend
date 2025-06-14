import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-nav-bar',
  imports: [CommonModule, RouterModule],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.scss'
})
export class NavBar {
  user;
  constructor(public auth: AuthService) {
    this.user = this.auth.user();
   }

  get userRole() {
    return this.user?.role;
  }

  onLogout() {
    this.auth.logout();
  }

}
