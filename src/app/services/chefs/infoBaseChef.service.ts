import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Chefs } from '../../models/chefs.model';
import { environment } from '../../../environment/environment';
import { ResponsableAudit } from '../../models/responsableAudit.model';
@Injectable({
  providedIn: 'root'
})
export class InfoBaseChefService {
  private apiUrl = `${environment.apiUrl}/api/chefs`;

  constructor(private http: HttpClient) {}

  createChefs(chef: Chefs, photo: File, attributions: string[], motsDuChef: string[]): Observable<Chefs> {
    const formData = new FormData();

    const chefBlob = new Blob([JSON.stringify(chef)], { type: 'application/json' });
    formData.append('chef', chefBlob);
    formData.append('photo', photo);
    const attributionsBlob = new Blob([JSON.stringify(attributions)], { type: 'application/json' });
    formData.append('attributions', attributionsBlob);
    const motsDuChefBlob = new Blob([JSON.stringify(motsDuChef)], { type: 'application/json' });
    formData.append('motsDuChef', motsDuChefBlob);

    return this.http.post<Chefs>(`${this.apiUrl}/create`, formData);
  }

  updateChefs(ancienContact: string, chef: Chefs, photo: File, attributions: string[], motsDuChef: string[]): Observable<Chefs> {
    const formData = new FormData();

    const chefBlob = new Blob([JSON.stringify(chef)], { type: 'application/json' });
    formData.append('chef', chefBlob);

    formData.append('photo', photo);

    const attributionsBlob = new Blob([JSON.stringify(attributions)], { type: 'application/json' });
    formData.append('attributions', attributionsBlob);

    const motsDuChefBlob = new Blob([JSON.stringify(motsDuChef)], { type: 'application/json' });
    formData.append('motsDuChef', motsDuChefBlob);

    return this.http.put<Chefs>(`${this.apiUrl}/update/${ancienContact}`, formData);

  }

  getAllChefs(order: string = 'desc'): Observable<Chefs[]> {
    return this.http.get<Chefs[]>(`${this.apiUrl}/list?order=${order}`);
  }

  getChefsById(contact: string): Observable<Chefs> {
      return this.http.get<Chefs>(`${this.apiUrl}/update/${contact}`);
  }

  getChefsByTypeDeChef(typeDeChef: string): Observable<Chefs[]> {
    return this.http.get<Chefs[]>(`${this.apiUrl}/type/${typeDeChef}`);
  }

  getAllResponsablesAudit(order: string = 'desc'): Observable<ResponsableAudit[]> {
    return this.http.get<ResponsableAudit[]>(`${this.apiUrl}/responsablesAudit/list?order=${order}`);
  }

  getResponsableAuditById(id: number): Observable<ResponsableAudit> {
    return this.http.get<ResponsableAudit>(`${this.apiUrl}/responsablesAudit/${id}`);
  }

  getResponsablesAuditByTypeDeChef(typeChef: string): Observable<ResponsableAudit[]> {
    return this.http.get<ResponsableAudit[]>(`${this.apiUrl}/responsablesAudit/typeChef/${typeChef}`);
  }

  getResponsablesAuditBySousType(sousType: string): Observable<ResponsableAudit[]> {
    return this.http.get<ResponsableAudit[]>(`${this.apiUrl}/responsablesAudit/sousType/${sousType}`);
  }
}
