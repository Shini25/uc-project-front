import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Texte } from '../../models/courriers/texte.model';
import { environment } from '../../../environment/environment';
@Injectable({
  providedIn: 'root'
})

export class TexteService {
  private apiUrl = `${environment.apiUrl}/api/textes`;

  constructor(private http: HttpClient) {}

  getAllTextes(): Observable<Texte[]> {
    return this.http.get<Texte[]>(this.apiUrl+'/all');
  }
}