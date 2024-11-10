import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UcAttribution } from '../../models/chefs.model';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class attributionService {
  private apiUrl = `${environment.apiUrl}/api/chefs`;

  constructor(private http: HttpClient) {}

  getAttributionsByChef(chefId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${chefId}/attributions`);
  }

  getAttributionsByChefContact(contact: string): Observable<UcAttribution[]> {
    return this.http.get<UcAttribution[]>(`${this.apiUrl}/attributions/contact/${contact}`);
  }
}
