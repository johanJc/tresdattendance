import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/assistant/list-attendance/list-attendance.component').then(m => m.ListAttendanceComponent)
    },
    {
        path: 'admin/houses',
        loadComponent: () => import('./pages/admin/houses/houses.component').then(m => m.HousesComponent)
    },
    {
        path: 'admin/houses/dates',
        loadComponent: () => import('./pages/admin/dates/attendace.component').then(m => m.AttendaceComponent)
    }
];
