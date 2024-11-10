import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrganizationalChartAudit } from '../../models/organizationalChartAudit.model';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class OrganizationalChartAuditService {
  private apiUrl = `${environment.apiUrl}/api/organizational-charts/audit`;

  constructor(private http: HttpClient) {}

  getAllOrganizationalChartAudits(idOrganizationalChart: number): Observable<OrganizationalChartAudit[]> {
    return this.http.get<OrganizationalChartAudit[]>(`${this.apiUrl}/${idOrganizationalChart}`);
  }

}

