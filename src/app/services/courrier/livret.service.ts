import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Livret } from '../../models/courriers/livret.model';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class LivretService {
  private apiUrl = `${environment.apiUrl}/api/livrets`; 
 

  constructor(private http: HttpClient) {}

  // Récupérer tous les livrets
  getAllLivrets(): Observable<Livret[]> {
    return this.http.get<Livret[]>(`${this.apiUrl}`);
  }

  // Récupérer un livret par ID
  getLivretById(id: number): Observable<Livret> {
    return this.http.get<Livret>(`${this.apiUrl}/${id}`);
  }

  // Mettre à jour un livret
  updateLivret(id: number, contenue: File, fileType: string, modifyby: string): Observable<void> {

    const formData = new FormData();
    formData.append('contenue', contenue);
    formData.append('modifyby', modifyby);
    formData.append('fileType', fileType);
    return this.http.put<void>(`${this.apiUrl}/${id}`, formData);
  }
  
  // Supprimer un livret
  deleteLivret(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
