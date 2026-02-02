import { Routes } from '@angular/router';

export const routes: Routes = [
    {path: 'recepcionistas', loadComponent: () => import('./pages/recepcionistas/list/list').then((m) => m.List)},
    {path: 'pacientes', loadComponent: () => import('./pages/pacientes/list/list').then((m) => m.List)},
];
