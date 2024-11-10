import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InfoMeetingBase } from '../../models/infoMeetingBase.model';
import { ParticipantOrganizerDTO } from '../../models/participantOrganizerDTO.model';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  private apiUrl = `${environment.apiUrl}/api/meetings`;

  constructor(private http: HttpClient) {}
    scheduleMeeting(
      dateMeeting: Date,
      location: string,
      objet: string,
      meetingType: string,
      logistics: string[],
      observations: string[],
      organizersMail: ParticipantOrganizerDTO[],
      participantsMail: ParticipantOrganizerDTO[],
      addBy: string
    ): Observable<InfoMeetingBase> {
      const meetingData = {
        dateMeeting: dateMeeting.toISOString(),
        location: location,
        objet: objet,
        meetingType: meetingType,
        logistics: logistics,
        observations: observations,
        organizersMail: organizersMail,
        participantsMail: participantsMail,
        addBy: addBy,
      };
  
      return this.http.post<InfoMeetingBase>(`${this.apiUrl}/schedule`, meetingData);
    }



  getAllMeetings(): Observable<InfoMeetingBase[]> {
    return this.http.get<InfoMeetingBase[]>(`${this.apiUrl}/all`);
  }

  getMeetingById(id: number): Observable<InfoMeetingBase> {
    return this.http.get<InfoMeetingBase>(`${this.apiUrl}/${id}`);
  }

  addAttendanceSheet(id: number, attendanceSheet: File, fileType: string, modifyby: string): Observable<void> {
    const formData = new FormData();
    formData.append('content', attendanceSheet);
    formData.append('fileType', fileType);
    formData.append('modifyby', modifyby);
    return this.http.put<void>(`${this.apiUrl}/${id}/addAttendanceSheet`, formData);
  }
}
