import { Component, inject } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';

@Component({
  selector: 'app-attendace',
  imports: [],
  templateUrl: './attendace.component.html',
  styleUrl: './attendace.component.scss'
})
export class AttendaceComponent {
  firestoreService = inject(FirestoreService);
  list: any[] = [];
  suscribeList;
  listAttendance: any[] = [];
  allData: any[] = [];
  selectedDate;

  ngOnInit() {
    this.getListAttendance();
  }

  getListAttendance() {
    this.suscribeList = this.firestoreService.getCollectionChanges('asistencia').subscribe((data: any) => {
      // Extraer las fechas y eliminar duplicados
      this.allData = data;
      this.list = [...new Set(data.map((item: any) => item.fecha).filter((fecha: string) => fecha))]
      .sort((a: string, b: string) => {
        const [dayA, monthA, yearA] = a.split('/').map(Number);
        const [dayB, monthB, yearB] = b.split('/').map(Number);
        return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime();
      });
    console.log('Fechas únicas de asistencia (ordenadas):', this.list);
    })
  }

  getListByDate(date: string) {
    this.selectedDate = date;
    this.listAttendance = this.allData.filter((item: any) => item.fecha === date);
    console.log('Lista de asistencia para la fecha seleccionada:', this.listAttendance);
  }

  goBack() {
    this.selectedDate = null;
  }  

  ngOnDestroy() {
    if (this.suscribeList) {
      this.suscribeList.unsubscribe();
    }
  }
}
