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

  /**
   * Obtiene los cambios en la colección especificada de Firestore.
   * @param path - Ruta de la colección en Firestore.
   * @returns - Observable que emite los cambios en la colección.
   */
  getCollectionChanges(path: string) {
    const refCollection = collection(this.firestore, path);
    return collectionData(refCollection) as Observable<any[]>;
  }

  /**
   * Confirma la asistencia de una persona en la colección 'asistencia' en Firestore.
   * @param data - Objeto que contiene el nombre y la fecha de la asistencia.
   * @returns - Promesa que se resuelve cuando la operación se completa.
   */
  async addAttendance(data: { selectedUser: any; fecha: string }) {
    const id = await this.createIdRandom(); // Generar un ID único
    const asistenciaData = {
      nombre: data.selectedUser.nombre,
      telefono: data.selectedUser.telefono,
      direccion: data.selectedUser.direccion,
      fecha: data.fecha,
      casaTresD: data.selectedUser.casaTresD,
      id: id,
    };
    const document = doc(this.firestore, `asistencia/${id}`);
    return setDoc(document, asistenciaData);
  }

  /**
   * Agregar ofrenda
   * @param data data - ofrenda
   * @returns 
   */
  async addOffering(data:any) {
    const id = await this.createIdRandom(); // Generar un ID único
    const offeringData = {
      ...data,
      id: id,
    };
    const document = doc(this.firestore, `ofrendas/${id}`);
    return setDoc(document, offeringData);
  }

  /**
   * Agrega una nueva persona a la colección 'bendecidos' en Firestore.
   * @param data - Objeto que contiene la información de la persona a agregar.
   * @returns - Promesa que se resuelve cuando la operación se completa.
   */
  async addNewPeople(data: { casaTresD: string; direccion: string, nombre: string; telefono: string }) {
    const id = await this.createIdRandom(); // Generar un ID único
    const people = {
      casaTresD: data.casaTresD,
      direccion: data.direccion,
      nombre: data.nombre,
      telefono: data.telefono,
    }
    const document = doc(this.firestore, `bendecidos/${id}`);
    return setDoc(document, people);
  }

    /**
   * Agrega una nueva casa de eventos
   * @param data - Objeto que contiene la información de la casa
   * @returns - Promesa que se resuelve cuando la operación se completa.
   */
    async createHouse(data: { direccion: string, nombre: string; responsable: string }) {
      const id = await this.createIdRandom(); // Generar un ID único
      const people = {
        id: id,
        direccion: data.direccion,
        nombre: data.nombre,
        responsable: data.responsable,
      }
      const document = doc(this.firestore, `casas/${id}`);
      return setDoc(document, people);
    }

  /**
   * Obtiene la lista de asistencia de una fecha específica.
   * @param fecha - Fecha en formato 'dd/mm/yyyy' para filtrar la asistencia.
   * @returns - Observable que emite la lista de asistencia para la fecha dada.
   */
  getaddAttendanceByDate(fecha: string): Observable<any[]> {
    const refCollection = collection(this.firestore, 'asistencia');
    const q = query(refCollection, where('fecha', '==', fecha));
    return collectionData(q) as Observable<any[]>;
  }

  // async handlerDeuda(data: any, enlace: string, id?: string, oldName?: string) {
  //   console.log("OldName: ", oldName, " Nuevo name: ", data.name)
  //   let id_ = await this.createIdRandom();
  //   let data_ = {
  //     name: data.name,
  //     amount: data.amount,
  //     id: id ?? id_
  //   }
  //   const document = doc(this.firestore, `${enlace}/${data_.id}`);
  //   // Si estamos editando una deuda, también actualizamos el historial
  //   if (id && oldName && oldName !== data.name) {
  //     await this.updateHistoryName(oldName, data.name);
  //   }
  //   return setDoc(document, data_)
  // }

  // async updateHistoryName(oldName: string, newName: string) {
  //   const refCollection = collection(this.firestore, 'HistorialPagos');
  //   const q = query(refCollection, where('nameDeuda', '==', oldName));
  //   const snapshot = await getDocs(q);

  //   const batch = writeBatch(this.firestore);

  //   snapshot.forEach((doc) => {
  //     const docRef = doc.ref;
  //     batch.update(docRef, { nameDeuda: newName });
  //   });

  //   await batch.commit();
  // }

  // async handlerHistory(data: any) {
  //   let id_ = await this.createIdRandom();
  //   let data_ = {
  //     date: data.date,
  //     discount: data.discount,
  //     idDeuda: data.idDeuda,
  //     nameDeuda: data.nameDeuda,
  //     id: id_,
  //   }
  //   const document = doc(this.firestore, `HistorialPagos/${data_.id}`);
  //   return setDoc(document, data_)
  // }

  // getHistoryByDeuda(idDeuda: string): Observable<any[]> {
  //   const refCollection = collection(this.firestore, 'HistorialPagos');
  //   const q = query(refCollection, where('idDeuda', '==', idDeuda));
  //   return collectionData(q) as Observable<any[]>;
  // }

  async deleteDocument(collectionName:string, id: string, name?:string): Promise<void> {
    // Eliminar el documento en la colecció
    const deudaRef = doc(this.firestore, `${collectionName}/${id}`);
    await deleteDoc(deudaRef);
    if(collectionName === 'casas'){
      // Eliminar todos los documentos en 'HistorialPagos' que tengan idDeuda igual a `id`
      const historialRef = collection(this.firestore, 'asistencia');
      const historialQuery = query(historialRef, where('casaTresD', '==', name));
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
}
