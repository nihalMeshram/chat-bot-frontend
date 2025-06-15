import { Routes } from '@angular/router';

export const documentsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list-documents/list-documents').then(m => m.ListDocuments),
  },
];
