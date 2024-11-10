import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TableauDeBord } from '../../models/courriers/accesReserve.model';
import { environment } from '../../../environment/environment';
@Injectable({
  providedIn: 'root'
})
export class TableauDeBordService {
    private apiUrl = `${environment.apiUrl}/api/acces-reserves`;

    constructor(private http: HttpClient) {}

    getAllTableauDeBords(): Observable<TableauDeBord[]> {
        return this.http.get<TableauDeBord[]>(this.apiUrl + '/all');
    }
}