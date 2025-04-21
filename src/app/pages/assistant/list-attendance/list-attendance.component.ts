import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NewBlessComponent } from '../../../components/new-bless/new-bless.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import confetti from 'canvas-confetti';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-list-attendance',
  imports: [NgSelectModule, FormsModule],
  templateUrl: './list-attendance.component.html',
  styleUrl: './list-attendance.component.scss'
})
export class ListAttendanceComponent {
  firestoreService = inject(FirestoreService);
  private modalService = inject(NgbModal);
  closeResult: WritableSignal<string> = signal('');
  list: any[] = [];
  selectedItemId;
  inProcess: boolean = false;
  attendanceInCurrentDate: any[] = [];
  attendanceConfirmed = false;

  ngOnInit() {
    this.getList();
    this.getListCurrentDate();
    let dateLastAttendance = sessionStorage.getItem('dateLastAttendance');
    if (dateLastAttendance === this.getCurrentDate()) {
      this.attendanceConfirmed = true;
    }
  }

  addNewBless() {
    this.openModal(NewBlessComponent);
  }

  openModal(content) {
    const modalRef = this.modalService.open(content, { centered: true });
    // Escuchar el evento emitido por NewBlessComponent
    modalRef.componentInstance.eventCloseModal.subscribe((event: any) => {
      console.log('Evento recibido desde NewBlessComponent:', event);
      this.closeModal(); // Cierra el modal
    });
  }

  eventCloseModal(event: any) {
    this.closeModal();
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  getList() {
    this.firestoreService.getCollectionChanges('bendecidos').subscribe((data) => {
      this.list = data;
      console.log("Lista de usuarios: ", this.list)
    })
  }

  async getListCurrentDate() {
    let date = await this.getCurrentDate();
    this.firestoreService.getCollectionChanges('asistencia').subscribe((data) => {
      this.attendanceInCurrentDate = data.filter(item => item.fecha === '8/04/2025');
      console.log("Asistencia en la fecha actual: ", this.attendanceInCurrentDate)
    })
  }

  getCurrentDate() {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexed
    const year = currentDate.getFullYear();
    return `${day}/${month}/${year}`;
  }

  async confirmAttendance() {
    if (!this.selectedItemId) return;
    if (this.inProcess) return;

    if (this.attendanceInCurrentDate.find(item => item.nombre === this.selectedItemId)) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Ya se ha registrado asistencia para este usuario en la fecha actual',
        confirmButtonText: 'Aceptar'
      })
      return;
    }

    this.inProcess = true;
    // Obtener fecha actual en formato dd//mm/yyyy
    const formattedDate = await this.getCurrentDate();

    // Obtener data del usuario seleccionado
    const selectedUser = this.list.find(item => item.nombre === this.selectedItemId);
 
   this.firestoreService.addAttendance({ selectedUser, fecha: '8/04/2025' }).then(() => {      
      // sessionStorage.setItem('dateLastAttendance', formattedDate);
      this.inProcess = false;
      this.attendanceConfirmed = true;
      this.celebrar();
    }).catch((error) => {
      console.error("Error al registrar asistencia: ", error)
      this.inProcess = false;
    })
    this.selectedItemId = null;

  }

  onSelectChange() {
    // Cierra el teclado llamando al método blur() en el elemento activo
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) {
      activeElement.blur();
    }
  }
  
  celebrar() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}
