import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ParticipantOrganizerDTO } from '../../models/participantOrganizerDTO.model';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class MeetingOrganizersService {
  private apiUrl = `${environment.apiUrl}/api/meetingOrganizers`;

  constructor(private http: HttpClient) {}

  getOrganizersByMeeting(meetingId: number): Observable<ParticipantOrganizerDTO[]> {
    return this.http.get<ParticipantOrganizerDTO[]>(`${this.apiUrl}/${meetingId}/meetings`);
  }
}