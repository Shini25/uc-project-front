import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class SendWhatsAppService {
  private apiUrl = `${environment.apiUrl}/api/send-whatsapp`;

  constructor(private http: HttpClient) {}

  sendReminderWhatsApp(phoneNumber: string, objet: string, date: string, lieu: string, addby: string, meetingId: number): Observable<string> {

    console.log('phoneNumber', phoneNumber);
    console.log('objet', objet);
    console.log('date', date);
    console.log('lieu', lieu);
    console.log('addby', addby);
    console.log('meetingId', meetingId);

    const formData = new FormData();
    formData.append('phoneNumber', phoneNumber);
    formData.append('objet', objet);
    formData.append('date', date);
    formData.append('lieu', lieu);
    formData.append('addby', addby);
    formData.append('meetingId', meetingId.toString());

    return this.http.post(`${this.apiUrl}/meeting`, formData, { responseType: 'text' })
      .pipe(
        catchError((error) => {
          console.error('Error sending WhatsApp message:', error);
          return throwError(() => new Error('Error sending WhatsApp message.'));
        })
      );
  }
}
