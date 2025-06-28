import { Component, inject } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../pipes/filter.pipe';
import * as XLSX from 'xlsx';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CurrencyPipe } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-attendace',
  imports: [FormsModule, FilterPipe, CurrencyPipe],
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
  route = inject(ActivatedRoute);
  casa;
  router = inject(Router);
  modalService = inject(NgbModal);
  ofrenda;
  inProcess = false;

  ngOnInit() {
    this.getParams();
    this.getListAttendance();
  }

  goBackHouses() {
    this.router.navigate(['/admin/houses']);
  }

  /**
   * Obtiene los parametros de la url
   */
  getParams() {
    this.route.queryParams.subscribe(params => {
      this.casa = JSON.parse(params['casa']);
      if (this.casa == 'todos') {
        this.getAllPeople();
      }
      console.log('Casa:', this.casa); // Imprime 'Casa 3D' en la consola
    });
  }

  filterListRadio(casa3D) {
    this.searchText = casa3D;
  }

  getAllPeople() {
    this.suscribeListAll = this.firestoreService.getCollectionChanges('bendecidos').subscribe((data) => {
      this.listAttendance = data;
    })
    return;
  }

  getListAttendance() {
    this.suscribeList = this.firestoreService.getCollectionChanges('asistencia').subscribe((data: any) => {
      // Extraer las fechas y eliminar duplicados
      this.allData = data;
      this.list = [...new Set(
        data
          .filter((item: any) => item.casaTresD === this.casa.nombre)
          .map((item: any) => item.fecha)
          .filter((fecha: string) => fecha)
      )]
        .sort((a: string, b: string) => {
          const [dayA, monthA, yearA] = a.split('/').map(Number);
          const [dayB, monthB, yearB] = b.split('/').map(Number);
          return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime();
        });
      console.log('Fechas únicas de asistencia (ordenadas):', this.list);
    })
  }

  getListByDate(date: string) {
    if (date === 'todos') {
      this.selectedDate = 'todos';
      this.suscribeListAll = this.firestoreService.getCollectionChanges('bendecidos').subscribe((data) => {
        console.log("Lista de bendecidos: ", data);
        // Filtrar los datos por la casa 3d actual 
        this.listAttendance = data.filter((item: any) => item.casaTresD === this.casa.nombre);
        // this.listAttendance = data;
      })
      return;
    }

    this.selectedDate = date;
    this.getOfferingByDate(this.selectedDate); // Obtener la oferta para la fecha seleccionada
    this.listAttendance = this.allData.filter((item: any) => (item.fecha === date && item.casaTresD === this.casa.nombre));
    console.log('Lista de asistencia para la fecha seleccionada:', this.listAttendance);
  }

  goBack() {
    if(this.casa == 'todos'){
      this.router.navigate(['/admin/houses']);    
      return;
    }
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Asistencia-' + date.replace(/\//g, '-'));

    // Genera el archivo Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Crea un Blob para descargar el archivo
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);

    // Crea un enlace para descargar el archivo
    const a = document.createElement('a');
    a.href = url;
    let nameFile = date == 'todos' ? 'todos-los-registros-Casa3D' : 'Asistencia-Casa3D-' + date.replace(/\//g, '-');
    a.download = `${nameFile}.xlsx`;
    a.click();

    // Limpia el objeto URL
    window.URL.revokeObjectURL(url);
    a.remove();
  }

  /**
 * Abre el modal para crear una casa
 * @param content 
 */
  openModal(content) {
    const modalRef = this.modalService.open(content, { centered: true });
  }

  /**
   * Cierra el modal
   */
  closeModal() {
    this.modalService.dismissAll();
  }

  getOfferingByDate(date: string) {
    // !AUN FALTA QUE ESTO FUNCIONE BIEN 
    this.firestoreService.getCollectionChanges('ofrenda').subscribe((data) => {
      this.inProcess = false;
      this.ofrenda = data.filter((item: any) => (item.fecha === date && item.casa === this.casa.nombre))[0];
      console.log('Ofrenda:', this.ofrenda);
    })
  }

  addOffering() {
    if (!this.ofrenda) { return; }

    this.inProcess = true;
    this.firestoreService.addOffering({
      casa: this.casa.nombre,
      ofrenda: this.ofrenda,
      fecha: this.selectedDate
    }).then(() => {
      this.inProcess = false;
      Swal.fire({
        icon: 'success',
        title: 'Ofrenda agregada correctamente',
        showConfirmButton: false,
        timer: 1500
      })
      this.closeModal();
    }).catch((error) => {
      this.inProcess = false;
      console.log(error);
    })
  }

  ngOnDestroy() {
    if (this.suscribeList) {
      this.suscribeList.unsubscribe();
    }

    if (this.suscribeListAll) {
      this.suscribeListAll.unsubscribe();
    }
  }
}
