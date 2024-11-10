import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',  
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

  forgotPasswordForm: FormGroup;
  message: string = '';
  error: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;


  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { 
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }
  onSubmit(): void {
    this.isLoading = true;
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.value.email;
      this.authService.requestPasswordReset(email).subscribe(
        response => {
          setTimeout(() => {
            this.isLoading = false;
            this.forgotPasswordForm.reset();
            console.log('Response:', response); 
            this.successMessage = 'Code de réinitialisation envoyé à votre adresse email.';
            this.errorMessage = '';
            setTimeout(() => {
            this.successMessage = '';
            this.router.navigate(['/reinitialiser-mot-de-passe']); 
            }, 3000);
          }, 2000);
        },
        error => {
          console.error('Error:', error); 
          if (error.status === 404) {
            this.isLoading = false;
            this.errorMessage = 'Adresse email introuvable. Veuillez vérifier et réessayer.';
            setTimeout(() => {
              this.errorMessage = '';
            }, 3000);
          } else {
            this.isLoading = false;
            this.errorMessage = 'Erreur lors de l\'envoi du code. Veuillez réessayer.';
            setTimeout(() => {
              this.errorMessage = '';
            }, 3000);
          }
          this.successMessage = '';
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      );
    }
  }

  closeModalErrorMessage(): void{
    this.errorMessage = '';
  }
  
}
