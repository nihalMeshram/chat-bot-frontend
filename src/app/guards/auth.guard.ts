import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function AuthGuard(allowedRoles: string[] = []): CanActivateFn {
  return async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    // ✅ wait until user is fetched (handles refresh/direct URL)
    await auth.isUserLoaded();

    if (!auth.isLoggedIn()) {
      router.navigate(['/login'], {
        queryParams: { redirectTo: state.url }, // store requested URL
      });
      return false;
    }

    if (allowedRoles.length && !auth.hasRole(allowedRoles)) {
      router.navigate(['/login']);
      return false;
    }

    return true;
  };
}
