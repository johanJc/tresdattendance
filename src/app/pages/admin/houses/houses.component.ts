import { Component, inject } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateHouseComponent } from '../../../components/create-house/create-house.component';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../pipes/filter.pipe';

@Component({
  selector: 'app-houses',
  imports: [CreateHouseComponent, FormsModule, FilterPipe],
  templateUrl: './houses.component.html',
  styleUrl: './houses.component.scss'
})
export class HousesComponent {
  list:any[] = [];
  firestoreService = inject(FirestoreService);
  modalService = inject(NgbModal);
  router = inject(Router);
  searchText = "";
  suscribeListAll;
  listAttendance: any[] = [];

  ngOnInit(){
    this.getList();
  }

  
  getListByDate(date: string) {
    this.router.navigate(['/admin/houses/dates'], { queryParams: { casa: JSON.stringify('todos') } });
  }

  /**
   * Obtiene la lista de casas
   */
  getList(){
    this.firestoreService.getCollectionChanges('casas').subscribe((data) => {
      this.list = data;
    })
  }

  goToDate(casa){
    this.router.navigate(['/admin/houses/dates'], { queryParams: { casa: JSON.stringify(casa) } });
  }

  deleteHouse(item){
    // !Para ELiminar una casa se debe validar si cuenta con fechas dentro osea asistencia, si cuenta con fechas no se puede eliminar
    //!Si no cuenta con fechas se puede eliminar
    //!Si cuenta con fechas se debe mostrar un mensaje de error
    //!Si se elimina la casa se debe eliminar todas las fechas de esa casa
    //!Si se elimina la casa se debe eliminar todas las fechas de esa casa

    Swal.fire({
      title: '¿Estás seguro?',
      text: "Si eliminas la casa se eliminarán todas las asistencias de esa casa",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar!'  
    })
    .then((result) => {
      if (result.isConfirmed) {
        this.firestoreService.deleteDocument('casas', item.id, item.nombre).then(() => {
          Swal.fire(
            'Eliminado!',
            'La casa ha sido eliminada.',
            'success'
          )
        })
      }
    })
    
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
}
