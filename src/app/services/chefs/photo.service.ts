import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class photoService {
  private apiUrl = `${environment.apiUrl}/api/chefs`;

  constructor(private http: HttpClient) {}

  getPhotosByChef(chefId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${chefId}/photos/base64`);
  }

  getPhotoById(photoId: number): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/photos/${photoId}/base64`);
  }
}