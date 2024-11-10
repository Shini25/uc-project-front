import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pta } from '../../models/courriers/pta.model';
import { environment } from '../../../environment/environment';


@Injectable({
  providedIn: 'root'
})  

export class PtaService {
  private apiUrl = `${environment.apiUrl}/api/ptas`;

  constructor(private http: HttpClient) {}

  getAllPtas(): Observable<Pta[]> {
    return this.http.get<Pta[]>(`${this.apiUrl}/all`);
  }

  updatePta(id: number, contenue: File, fileType: string, modifyby: string): Observable<void> {

    const formData = new FormData();
    formData.append('contenue', contenue);
    formData.append('modifyby', modifyby);
    formData.append('fileType', fileType);
    return this.http.put<void>(`${this.apiUrl}/${id}`, formData);
  }

  validerPta(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/valider/${id}`, null);
  }

}