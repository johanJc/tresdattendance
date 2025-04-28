import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';
import { first } from 'rxjs';

@Component({
  selector: 'app-new-bless',
  imports: [NgSelectModule, FormsModule, ReactiveFormsModule],
  templateUrl: './new-bless.component.html',
  styleUrl: './new-bless.component.scss'
})
export class NewBlessComponent {
  firestoreService = inject(FirestoreService);
  formBuilder = inject(FormBuilder);
  @Output() eventCloseModal = new EventEmitter<any>();
  form: FormGroup;
  casas = []
  selectedItemId;
  inProcess: boolean = false;

  ngOnInit() {
    this.getHouses();
    this.form = this.formBuilder.group({
      casaTresD: ['', Validators.required],
      direccion: ['', Validators.required],
      nombre: ['', Validators.required],
      telefono: ['', Validators.required]
    });
  }

  getHouses(){
    this.firestoreService.getCollectionChanges('casas').subscribe((data) => {
      this.casas = data;
    })
  }

  async addNewBless() {
    if (this.form.invalid) { 
      Swal.fire({
        text: 'Por favor, completa todos los campos.',
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      });     
      return; 
    }
    
    let result = await this.validateExistence();
    if(!result){return}

    this.inProcess = true;
    this.firestoreService.addNewPeople(this.form.value).then(() => {
      Swal.fire({
        title: 'Bendecido agregado',
        text: 'Bendiciones, has sido agregado correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      })
      this.form.reset();
      this.inProcess = false;
    }).catch((error) => {
      this.inProcess = false;
      console.error("Error al agregar bendecido: ", error);
    });
  }

  validateExistence(): Promise<boolean> {
    return new Promise((resolve) => {
      const { nombre, telefono } = this.form.value;
      this.firestoreService.getCollectionChanges('bendecidos')
        .pipe(first()) // Obtiene solo el primer valor emitido y completa la suscripción
        .subscribe((data) => {
          const exists = data.some(item => item.nombre === nombre || item.telefono === telefono);
          if (exists) {
            Swal.fire({
              title: 'Error',
              text: 'Ya existe una persona registrada con ese nombre o teléfono.',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
            resolve(false);
          } else {
            resolve(true);
          }
        });
    });
  }

  closeModal() {
    this.form.reset();
    this.selectedItemId = null;
    this.inProcess = false;
    this.eventCloseModal.emit(true);
  }
}
