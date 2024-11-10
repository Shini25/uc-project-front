import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environment/environment';
@Injectable({
  providedIn: 'root'
})
export class SendMailService {
    private apiUrl = `${environment.apiUrl}/api/send-mail`;

    constructor(private http: HttpClient) {}

    sendReminderEmail(email: string, objet: string, date: string, lieu: string, addby: string, meetingId: number): Observable<string> {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('objet', objet);
        formData.append('date', date);
        formData.append('lieu', lieu);
        formData.append('addby', addby);
        formData.append('meetingId', meetingId.toString());

        return this.http.post(`${this.apiUrl}/meeting`, formData, { responseType: 'text' })
            .pipe(
                catchError((error) => {
                    console.error('Error sending email:', error);
                    return throwError(() => new Error('Error sending email.'));
                })
            );
    }
}
