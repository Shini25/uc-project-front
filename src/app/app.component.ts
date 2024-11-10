import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { Router, NavigationEnd } from '@angular/router';
import { FlowbiteService } from './services/flowbite.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,

  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'FrontBankLoan';
  pendingLoansCount: number = 0;
  user: any;
  numero: string | null = null;
  isLivretOpen = false;
  finaluser: any;
  isDarkMode = false;

  constructor(private authService: AuthService, private userService: UserService, private router: Router, private flowbiteService: FlowbiteService) {}

  ngOnInit() {
    this.flowbiteService.loadFlowbite(flowbite => {
      console.log('Flowbite loaded:', flowbite);
    });
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.isAuthenticated()) {
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
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  toggleLivret() {
    this.isLivretOpen = !this.isLivretOpen;
  }

  toggleDarkMode(): void {
    const isDarkMode = document.documentElement.classList.contains('dark');
    this.isDarkMode = !this.isDarkMode;
    if (isDarkMode) {
      document.documentElement.classList.remove('dark'); 
    } else {
      document.documentElement.classList.add('dark'); 
    }
  }

}