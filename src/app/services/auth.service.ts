import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = `${environment.apiUrl}/api/auth`;

  constructor(private http: HttpClient) { }

  login(credentials: { numero: string, password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, credentials);
  }

  saveToken(token: string) {
    localStorage.setItem('jwtToken', token);
    console.log('Token saved:', token);
  }

  getToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('jwtToken');
    }
    return null;
  }

  logout() {
    
    localStorage.removeItem('jwtToken');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null;
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/request-password-reset`, email);
  }
  

  resetPassword(email: string, verificationCode: string, newPassword: string): Observable<any> {
    const payload = {
      email: email,
      verificationCode: verificationCode,
      newPassword: newPassword
    };
    return this.http.post(`${this.baseUrl}/reset-password`, payload);
  }
}
