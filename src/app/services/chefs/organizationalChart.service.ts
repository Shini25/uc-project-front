import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrganizationalChart } from '../../models/organizationalChart.model';
import { environment } from '../../../environment/environment';
@Injectable({
  providedIn: 'root'
})
export class OrganizationalChartService {
    private apiUrl =    `${environment.apiUrl}/api/organizational-charts`;

    constructor(private http: HttpClient) {}

    getAllOrganizationalCharts(): Observable<OrganizationalChart[]> {
        return this.http.get<OrganizationalChart[]>(this.apiUrl);
    }

    createOrganizationalChart(title: string, type: string, contenue: File, addby: string, filetype: string): Observable<OrganizationalChart> {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('type', type);
        formData.append('contenue', contenue);
        formData.append('addby', addby);
        formData.append('filetype', filetype);
        return this.http.post<OrganizationalChart>(`${this.apiUrl}/add`, formData);
    }

    updateOrganizationalChart(id: number, content: File, fileType: string, modifyby: string): Observable<OrganizationalChart> {
        const formData = new FormData();
        formData.append('contenue', content);
        formData.append('fileType', fileType);
        formData.append('modifyby', modifyby);
        return this.http.put<OrganizationalChart>(`${this.apiUrl}/${id}`, formData);
    }

    deleteOrganizationalChart(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}