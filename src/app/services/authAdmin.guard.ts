import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthAdminGuard implements CanActivate {
  finaluser: any;
  user: any;
  userId: string | null = null;
  userFilter: string | null = null;

  constructor(private authService: AuthService, private router: Router, private userService: UserService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.authService.isAuthenticated()) {
      this.userService.getUserInfo().subscribe(user => {
        this.user = user;
        console.log('User retrieved:', this.user.username);
        this.userId = this.user.username;

        if (this.user.username) {
          this.userService.getUserByNumero(this.user.username).subscribe(finalUser => {
            this.userFilter = finalUser.accountType;

            if (finalUser && finalUser.accountType === 'ADMIN') {
              resolve(true);
            } else {
              this.router.navigate(['auth/acces-denied']);
              resolve(false);
            }
          });
        } else {
          this.router.navigate(['auth/acces-denied']);
            resolve(false);
          }
        });
      } else {
        this.router.navigate(['auth/login']);
        resolve(false);
      }
    });
  }
}
