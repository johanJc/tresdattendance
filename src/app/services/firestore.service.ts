import { inject, Injectable } from '@angular/core';
import { collectionData, doc, Firestore, getDocs, query, setDoc, deleteDoc, where, writeBatch } from '@angular/fire/firestore';
import { collection } from '@firebase/firestore';
import { Observable } from 'rxjs';

// const { v4: uuidv4 } = require('uuid');
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore: Firestore = inject(Firestore)
  constructor() { }


  createIdRandom() {
    let id = uuidv4();
    return id;
  }

  getCollectionChanges(path: string) {
    const refCollection = collection(this.firestore, path);
    return collectionData(refCollection) as Observable<any[]>;
  }

  async handlerDeuda(data: any, enlace: string, id?: string, oldName?: string) {
    console.log("OldName: ", oldName, " Nuevo name: ", data.name)
    let id_ = await this.createIdRandom();
    let data_ = {
      name: data.name,
      amount: data.amount,
      id: id ?? id_
    }
    const document = doc(this.firestore, `${enlace}/${data_.id}`);
    // Si estamos editando una deuda, también actualizamos el historial
    if (id && oldName && oldName !== data.name) {
      await this.updateHistoryName(oldName, data.name);
    }
    return setDoc(document, data_)
  }

  async updateHistoryName(oldName: string, newName: string) {
    const refCollection = collection(this.firestore, 'HistorialPagos');
    const q = query(refCollection, where('nameDeuda', '==', oldName));
    const snapshot = await getDocs(q);
  
    const batch = writeBatch(this.firestore);
  
    snapshot.forEach((doc) => {
      const docRef = doc.ref;
      batch.update(docRef, { nameDeuda: newName });
    });
  
    await batch.commit();
  }

  async handlerHistory(data: any) {
    let id_ = await this.createIdRandom();
    let data_ = {
      date: data.date,
      discount: data.discount,
      idDeuda: data.idDeuda,
      nameDeuda: data.nameDeuda,
      id: id_,
    }
    const document = doc(this.firestore, `HistorialPagos/${data_.id}`);
    return setDoc(document, data_)
  }

  getHistoryByDeuda(idDeuda: string): Observable<any[]> {
    const refCollection = collection(this.firestore, 'HistorialPagos');
    const q = query(refCollection, where('idDeuda', '==', idDeuda));
    return collectionData(q) as Observable<any[]>;
  }

  async deleteDocument(id: string): Promise<void> {
    // Eliminar el documento en la colección 'Deudas'
    const deudaRef = doc(this.firestore, `Deudas/${id}`);
    await deleteDoc(deudaRef);
  
    // Eliminar todos los documentos en 'HistorialPagos' que tengan idDeuda igual a `id`
    const historialRef = collection(this.firestore, 'HistorialPagos');
    const historialQuery = query(historialRef, where('idDeuda', '==', id));
    const snapshot = await getDocs(historialQuery);
  
    // Usar un batch para eliminar múltiples documentos
    const batch = writeBatch(this.firestore);
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
  
    // Ejecutar el batch de eliminación
    await batch.commit();
  }
}
