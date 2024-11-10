import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PtaAudit } from '../../models/courriers/ptaAudit.model';
import { environment } from '../../../environment/environment';
@Injectable({
  providedIn: 'root'
})  

export class PtaAuditService {
  private apiUrl = `${environment.apiUrl}/api/pta-audit`;

  constructor(private http: HttpClient) {}

  getAllPtasAuditByCourrierId(idCourrier: number): Observable<PtaAudit[]> {
    return this.http.get<PtaAudit[]>(`${this.apiUrl}/${idCourrier}`);
  }

}