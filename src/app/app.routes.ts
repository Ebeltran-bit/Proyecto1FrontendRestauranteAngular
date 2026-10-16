import { Routes } from '@angular/router';

import { authGuard, guestGuard, managerGuard } from './core/auth/guards';

export const routes: Routes = [
  {
    path: 'login',
    canMatch: [guestGuard],
    loadComponent: () => import('./features/login/login-page').then((m) => m.LoginPage),
  },
  {
    path: '',
    canMatch: [authGuard],
    loadComponent: () => import('./layout/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'sala' },
      {
        path: 'sala',
        loadComponent: () => import('./features/floor/floor-page').then((m) => m.FloorPage),
      },
      {
        path: 'sala/mesa/:tableId',
        loadComponent: () => import('./features/table-detail/table-page').then((m) => m.TablePage),
      },
      {
        path: 'historial',
        canMatch: [managerGuard],
        loadComponent: () => import('./features/history/history-page').then((m) => m.HistoryPage),
      },
      {
        path: 'equipo',
        canMatch: [managerGuard],
        loadComponent: () => import('./features/staff/staff-page').then((m) => m.StaffPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
