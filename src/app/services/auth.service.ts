import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = signal<AuthUser | null>(null);
  loading = signal(true);

  constructor(private http: HttpClient, private router: Router) {
    this.fetchCurrentUser();
  }

  async fetchCurrentUser(): Promise<void> {
    this.loading.set(true);
    try {
      const user = await this.http
        .get<AuthUser>(`${environment.apiUrl}/auth/me`, { withCredentials: true })
        .toPromise();
      this.user.set(user || null);

    } catch {
      this.user.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  isUserLoaded(): Promise<void> {
    return new Promise(resolve => {
      const check = () => {
        if (!this.loading()) resolve();
        else setTimeout(check, 50);
      };
      check();
    });
  }

  isLoggedIn() {
    return !!this.user();
  }

  hasRole(role: string | string[]) {
    const currentRole = this.user()?.role;
    return Array.isArray(role)
      ? role.includes(currentRole ?? '')
      : currentRole === role;
  }

  logout() {
    this.http.post(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true }).subscribe({
      next: () => {
        this.user.set(null);
        this.router.navigate(['/login']);
      },
      error: () => {
        // Even if logout fails, clear local state
        this.user.set(null);
        this.router.navigate(['/login']);
      },
    });
  }
}
