import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {
  user: any;
  finaluser: any;

  constructor(private userService: UserService, private authService: AuthService, private router: Router) {}

  fetchUserInfo() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.userService.getUserInfo().subscribe(
      data => {
        this.user = data;
        console.log('User info:', this.user.username);
        this.userService.getUserByNumero(this.user.username).subscribe(user => {
          this.finaluser = user;
        });
      },
      err => {
        console.error('Error fetching user info', err);
        if (err.status === 403) {
          this.router.navigate(['/login']);
        }
      }
    );
  }
}
