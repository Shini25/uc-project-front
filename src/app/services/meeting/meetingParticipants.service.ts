import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ParticipantOrganizerDTO } from '../../models/participantOrganizerDTO.model';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class MeetingParticipantsService {
  private apiUrl = `${environment.apiUrl}/api/meetingParticipants`;

  constructor(private http: HttpClient) {}

  getParticipantsByMeeting(meetingId: number): Observable<ParticipantOrganizerDTO[]> {
    return this.http.get<ParticipantOrganizerDTO[]>(`${this.apiUrl}/${meetingId}/meetings`);
  }
}