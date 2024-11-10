import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User_account } from '../models/user.model';
import { AuthService } from './auth.service';
import { environment } from '../../environment/environment';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/api/users`;
  private numeroKey = 'userNumero';

  constructor(private http: HttpClient, private authService: AuthService) {}

  addUser(user_account: User_account): Observable<User_account> {
    return this.http.post<User_account>(`${this.apiUrl}/adduser`, user_account);
  }

  getAllUsers(): Observable<User_account[]> {
    return this.http.get<User_account[]>(`${this.apiUrl}`);
  }

  checkUsernameExists(numero: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-numero?numero=${numero}`);
  }

  setNumero(numero: string) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.numeroKey, numero);
      console.log('Numero stored in UserService:', numero); 
    } else {
      console.error('localStorage is not available');
    }
  }

  getUserByNumero(numero: string): Observable<User_account> {
    return this.http.get<User_account>(`${this.apiUrl}/${numero}`);
  }

  getUserInfo(): Observable<User_account> {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No token found');
    }

    return this.http.get<User_account>(`${this.apiUrl}/user-info`, {
      headers: {
        Authorization: `Bearer ${token}` 
      }
    });
  }

  updateEtat(numero: string, etat: string): Observable<User_account> {
    const formData = new FormData();
    formData.append('etat', etat);
    return this.http.put<User_account>(`${this.apiUrl}/${numero}/etat`, formData);
  }

  updateStatus(numero: string, status: string): Observable<User_account> {
    const formData = new FormData();
    formData.append('status', status);
    return this.http.put<User_account>(`${this.apiUrl}/${numero}/status`, formData);
  }
}