import { Component, inject, signal, TemplateRef, WritableSignal } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NewBlessComponent } from '../../components/new-bless/new-bless.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import confetti from 'canvas-confetti';

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

  ngOnInit() {
    this.getList();
  }

  addNewBless(){
    this.openModal(NewBlessComponent);
  }

  openModal(content) {
		this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
			(result) => {
				this.closeResult.set(`Closed with: ${result}`);
			},
			(reason) => {
				this.closeResult.set(`Dismissed ${this.getDismissReason(reason)}`);
			},
		);
	}

  private getDismissReason(reason: any): string {
		switch (reason) {
			case ModalDismissReasons.ESC:
				return 'by pressing ESC';
			case ModalDismissReasons.BACKDROP_CLICK:
				return 'by clicking on a backdrop';
			default:
				return `with: ${reason}`;
		}
	}

  getList(){
    this.firestoreService.getCollectionChanges('bendecidos').subscribe((data) => {
      this.list = data;
      console.log("Lista de asistencia: ", this.list)
    })
  }

  confirmAttendance(){
    this.celebrar();
  }

  celebrar() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}
