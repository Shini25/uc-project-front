import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
@Injectable({
  providedIn: 'root'
})
export class MeetingObservationsService {
  private apiUrl = `${environment.apiUrl}/api/meetingObservations`;

  constructor(private http: HttpClient) {}

  getObservationsByMeeting(meetingId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${meetingId}/meetings`);
  }
}
    