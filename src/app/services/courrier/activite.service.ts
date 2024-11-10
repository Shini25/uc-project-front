import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Activite } from '../../models/courriers/activite.model';
import { environment } from '../../../environment/environment';
@Injectable({
  providedIn: 'root'
})

export class ActiviteService {
  private apiUrl = `${environment.apiUrl}/api/activites`;

  constructor(private http: HttpClient) {}

  // Récupérer toutes les activités
  getAllActivites(): Observable<Activite[]> {
    return this.http.get<Activite[]>(`${this.apiUrl}/all`);
  }

  // Récupérer les activités par jour
  getActivitesByDay(date: string): Observable<Activite[]> {
    return this.http.get<Activite[]>(`${this.apiUrl}/day/${date}`);
  }

  // Récupérer les activités par mois
  getActivitesByMonth(year: number, month: number): Observable<Activite[]> {
    return this.http.get<Activite[]>(`${this.apiUrl}/month/${year}/${month}`);
  }

  // Récupérer les activités par trimestre
  getActivitesByQuarter(year: number, quarter: number): Observable<Activite[]> {
    return this.http.get<Activite[]>(`${this.apiUrl}/quarter/${year}/${quarter}`);
  }

  // Récupérer les activités par semestre
  getActivitesBySemester(year: number, semester: number): Observable<Activite[]> {
    return this.http.get<Activite[]>(`${this.apiUrl}/semester/${year}/${semester}`);
  }

  // Récupérer les activités par semaine
  getActivitesByWeek(date: string): Observable<Activite[]> {
    return this.http.get<Activite[]>(`${this.apiUrl}/week/${date}`);
  }
}