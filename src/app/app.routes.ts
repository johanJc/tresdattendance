import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/assistant/list-attendance/list-attendance.component').then(m => m.ListAttendanceComponent)
    },
    {
        path: 'admin',
        loadComponent: () => import('./pages/admin/attendace/attendace.component').then(m => m.AttendaceComponent)
    }
];
