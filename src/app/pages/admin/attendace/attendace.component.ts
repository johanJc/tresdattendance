import { Component, inject } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../pipes/filter.pipe';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-attendace',
  imports: [FormsModule, FilterPipe],
  templateUrl: './attendace.component.html',
  styleUrl: './attendace.component.scss'
})
export class AttendaceComponent {
  firestoreService = inject(FirestoreService);
  list: any[] = [];
  suscribeList;
  suscribeListAll;
  listAttendance: any[] = [];
  allData: any[] = [];
  selectedDate;
  searchText;

  ngOnInit() {
    this.getListAttendance();
  }

  filterListRadio(casa3D){
    this.searchText = casa3D;
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
    if(date === 'todos') {
      this.selectedDate = 'todos';
      this.suscribeListAll = this.firestoreService.getCollectionChanges('bendecidos').subscribe((data) => {
        this.listAttendance = data;
      })
      return;
    }

    this.selectedDate = date;
    this.listAttendance = this.allData.filter((item: any) => item.fecha === date);
    console.log('Lista de asistencia para la fecha seleccionada:', this.listAttendance);
  }

  goBack() {
    this.selectedDate = null;
    this.searchText = null;
    this.listAttendance = null;
  }  

  downloadExcel(date) {
    if (!this.listAttendance || this.listAttendance.length === 0) {
      console.error('No hay datos para exportar.');
      return;
    }

    // Prepara los datos para el archivo Excel
    const data = this.listAttendance.map((item: any) => ({
      Nombre: item.nombre || 'N/A',
      Telefono: item.telefono || 'N/A',
      Fecha: item.fecha || 'N/A',
      Casa3D: item.casaTresD || 'N/A',
      Asistencia: 'Si',
    }));

    // Crea la hoja de cálculo
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Crea el libro de trabajo
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Asistencia-'+date.replace(/\//g, '-'));

    // Genera el archivo Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Crea un Blob para descargar el archivo
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);

    // Crea un enlace para descargar el archivo
    const a = document.createElement('a');
    a.href = url;
    let nameFile = date == 'todos' ? 'todos-los-registros-Casa3D' : 'Asistencia-Casa3D-'+date.replace(/\//g, '-');
    a.download = `${nameFile}.xlsx`;
    a.click();

    // Limpia el objeto URL
    window.URL.revokeObjectURL(url);
    a.remove();
  }

  ngOnDestroy() {
    if (this.suscribeList) {
      this.suscribeList.unsubscribe();
    }

    if(this.suscribeListAll){
      this.suscribeListAll.unsubscribe();
    }
  }
}
