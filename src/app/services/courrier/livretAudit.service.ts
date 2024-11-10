import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { LivretAudit } from "../../models/courriers/livretAudit.model";
import { environment } from '../../../environment/environment';
@Injectable({
    providedIn: 'root'
})
export class LivretAuditService {
    private apiUrl = `${environment.apiUrl}/api/livret-audit`;
    constructor(private http: HttpClient) {}

    getAllLivretsAuditByCourrierId(idCourrier: number): Observable<LivretAudit[]> {
      return this.http.get<LivretAudit[]>(`${this.apiUrl}/${idCourrier}`);
    }
}