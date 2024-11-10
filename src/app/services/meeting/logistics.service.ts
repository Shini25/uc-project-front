import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class LogisticsService {
  private apiUrl = `${environment.apiUrl}/api/logistics`;

  constructor(private http: HttpClient) {}

  getLogisticsByMeeting(meetingId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${meetingId}/meetings`);
  }
}

