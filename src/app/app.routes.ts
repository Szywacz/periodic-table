import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/periodic-table/periodic-table.component').then(
        (c) => c.PeriodicTableComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
