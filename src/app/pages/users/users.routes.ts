import { Routes } from '@angular/router';

export const usersRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list-users/list-users').then(m => m.ListUsers),
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./add-user/add-user').then(m => m.AddUser),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./edit-user/edit-user').then(m => m.EditUser),
  },
];
