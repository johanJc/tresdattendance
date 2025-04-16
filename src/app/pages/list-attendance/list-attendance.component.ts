import { Component, inject, signal, TemplateRef, WritableSignal } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NewBlessComponent } from '../../components/new-bless/new-bless.component';

@Component({
  selector: 'app-list-attendance',
  imports: [],
  templateUrl: './list-attendance.component.html',
  styleUrl: './list-attendance.component.scss'
})
export class ListAttendanceComponent {
  firestoreService = inject(FirestoreService);
  private modalService = inject(NgbModal);
	closeResult: WritableSignal<string> = signal('');
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
      console.log("Lista de asistencia: ", data)
    })
  }
}
