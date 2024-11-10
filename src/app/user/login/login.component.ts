import { Component, OnInit,  } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User_account } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { UserSessionService } from '../../services/userSessionService';
import { map } from 'rxjs';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatOptionModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  loading = false;
  numero: string = '';
  password: string = '';
  user: User_account = new User_account('', '', '', '', 'ONLINE', 'SIMPLE', 'ACTIVE');
  accountStatuses = ['ONLINE', 'OFFLINE'];
  accountTypes = ['ADMIN', 'SIMPLE', 'OTHER'];
  accountStates = ['ACTIVE', 'INACTIVE'];
  finaluser: any;
  showLoginForm = true;
  successMessage: string | null = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  currentUser: string | null = null;

  constructor(
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    private userSessionService: UserSessionService,
  ) {
    this.loginForm = new FormGroup({
      numero: new FormControl('', [Validators.required, Validators.minLength(6)]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)])
    });
  }

  ngOnInit(): void {}

  toggleForm() {
    this.showLoginForm = !this.showLoginForm;
  }

  login() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      setTimeout(() => {
        this.errorMessage = '';
      }, 2500);
      return;
    }

    const { numero, password } = this.loginForm.value;
    this.isLoading = true;
    
    // Check if the user is active
    this.userService.getUserByNumero(numero).subscribe({
      next: user => {
        if (user.accountState === 'iNACTIVE') {
          this.errorMessage = 'Votre compte est désactivé. Veuillez contacter l\'administrateur.';
          this.isLoading = false;
          return;
        } else {
          this.authService.login({ numero, password }).subscribe(
            data => {
              this.authService.saveToken(data.jwt);
              this.userSessionService.setNumero(numero);
    
              this.userService.getUserInfo().subscribe(
                userInfo => {
                  this.user = userInfo;
                  console.log('User info:', this.user.numero);
                  this.userService.getUserByNumero(this.user.numero).subscribe(user => {
                    this.finaluser = user;
                  });
                },
                err => {
                  console.error('Error fetching user info', err);
                }
              );
    
              setTimeout(() => {
                this.isLoading = false;
                this.router.navigateByUrl('/home', { skipLocationChange: true }).then(() => {
                  this.router.navigate(['/home']);
                });
              }, 2000);
            },
            err => {
              console.error('Login error:', err);
              this.isLoading = false; 
              // Error handling as in your code
              if (err.status === 404) {
                this.errorMessage = 'Utilisateur non trouvé';
              } else if (err.status === 401) {
                this.errorMessage = 'Identifiants invalides';
              } else if (err.status === 403) {
                this.errorMessage = 'Mot de passe ou matricule incorrect';
              } else if (err.error && err.error.message) {
                this.errorMessage = 'Vérifiez le serveur';
              } else if (err.message === 'Échec de la récupération') {
                this.errorMessage = 'Erreur de connexion au serveur. Veuillez réessayer plus tard.';
              } else {
                this.errorMessage = 'Login error';
              }
            }
          );
        }
      }
    });
    
  }

  logout() {
    this.authService.logout();
    this.userSessionService.clearNumero();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  closeModalErrorMessage(): void{
    this.errorMessage = '';
  }
}
