import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/list-attendance/list-attendance.component').then(m => m.ListAttendanceComponent)
    }
];
