import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirestoreService } from '../../services/firestore.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-house',
  imports: [ReactiveFormsModule],
  templateUrl: './create-house.component.html',
  styleUrl: './create-house.component.scss'
})
export class CreateHouseComponent {
  form: FormGroup;
  formBuilder = inject(FormBuilder);
  inProcess = false;
  firestore = inject(FirestoreService);
  @Output() eventCloseModal = new EventEmitter<any>();

  ngOnInit() {
    this.form = this.formBuilder.group({
      nombre: ['', Validators.required],
      responsable: ['', Validators.required],
      direccion: ['', Validators.required],
    });
  }

  createhouse() {
    if (!this.form.valid) {return;}
    this.inProcess = true;
    this.firestore.createHouse(this.form.value).then(() => {
      this.inProcess = false;
      this.eventCloseModal.emit(true);
      Swal.fire({        
        text: 'Casa creada correctamente',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
    }).catch((error) => {console.log("Error" , error)});
  }
}
