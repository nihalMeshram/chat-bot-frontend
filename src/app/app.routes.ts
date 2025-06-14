import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { AuthGuard } from './guards/auth.guard';
import { NavBar } from './layouts/nav-bar';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },

  {
    path: '',
    component: NavBar,
    canActivate: [AuthGuard()],
    children: [ ]
  },
];
