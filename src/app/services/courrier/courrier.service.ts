import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Courrier } from '../../models/courriers/courrier.model';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class CourrierService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  // creation livret
  creationLivret(
    titre: string, 
    contenue: File, 
    type: string, 
    typeDeContenue: string, 
    userId: string
  ): Observable<Courrier> {
    const formData = new FormData();
    formData.append('titre', titre);
    formData.append('contenue', contenue);
    formData.append('type', type);
    formData.append('typeDeContenue', typeDeContenue);
    formData.append('userId', userId);

    return this.http.post<Courrier>(`${this.apiUrl}/livrets/insertion/personalise`, formData);
  }

  // creation pta
  creationPta(
    titre: string, 
    contenue: File, 
    type: string, 
    sousType: string,
    typeDeContenue: string, 
    userId: string
  ): Observable<Courrier> {
    const formData = new FormData();
    formData.append('titre', titre);
    formData.append('contenue', contenue);
    formData.append('type', type);
    console.log("ito ny type: ", type);
    formData.append('sousType', sousType);
    formData.append('typeDeContenue', typeDeContenue);
    formData.append('userId', userId);

    return this.http.post<Courrier>(`${this.apiUrl}/ptas/insertion/personalise`, formData);
  }

  // creation activite
  createActivite(
    titre: string, 
    contenue: File, 
    type: string, 
    typeDeContenue: string, 
    userId: string
  ): Observable<Courrier> {
    const formData = new FormData();
    formData.append('titre', titre);
    formData.append('contenue', contenue);
    formData.append('type', type);
    formData.append('typeDeContenue', typeDeContenue);
    formData.append('userId', userId);

    return this.http.post<Courrier>(`${this.apiUrl}/activites/insertion/personalise`, formData);
  }

  createTexte(
    titre: string, 
    contenue: File, 
    type: string, 
    typeDeContenue: string, 
    userId: string
  ): Observable<Courrier> {
    const formData = new FormData();
    formData.append('titre', titre);
    formData.append('contenue', contenue);
    formData.append('type', type);
    formData.append('typeDeContenue', typeDeContenue);
    formData.append('userId', userId);

    return this.http.post<Courrier>(`${this.apiUrl}/textes/insertion/personalise`, formData);
  } 

  createAutreDocument(
    titre: string, 
    contenue: File, 
    type: string, 
    typeDeContenue: string, 
    userId: string
  ): Observable<Courrier> {
    const formData = new FormData();
    formData.append('titre', titre);
    formData.append('contenue', contenue);
    formData.append('type', type);
    formData.append('typeDeContenue', typeDeContenue);
    formData.append('userId', userId);

    return this.http.post<Courrier>(`${this.apiUrl}/autre-documents/insertion/personalise`, formData);
  }

  createTableauDeBord(
    titre: string, 
    contenue: File, 
    type: string, 
    typeDeContenue: string, 
    userId: string
  ): Observable<Courrier> {
    const formData = new FormData();
    formData.append('titre', titre);
    formData.append('contenue', contenue);
    formData.append('type', type);
    formData.append('typeDeContenue', typeDeContenue);
    formData.append('userId', userId);

    return this.http.post<Courrier>(`${this.apiUrl}/acces-reserves/insertion/personalise`, formData);
  }
}

