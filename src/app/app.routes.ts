import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { AuthGuard } from './guards/auth.guard';
import { NavBar } from './layouts/nav-bar';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },

  {
    path: '',
    component: NavBar,
    canActivate: [AuthGuard()],
    children: [
      { path: 'home', component: Home },
      {
        path: 'users',
        canActivate: [AuthGuard(['admin'])],
        loadChildren: () => import('./pages/users/users.routes').then(m => m.usersRoutes),
      },
      {
        path: 'documents',
        canActivate: [AuthGuard(['admin', 'editor'])],
        loadChildren: () => import('./pages/documents/documents.routes').then(m => m.documentsRoutes),
      },
    ]
  },
];
