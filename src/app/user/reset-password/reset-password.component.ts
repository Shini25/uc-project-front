import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {


  resetPasswordForm: FormGroup;
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';


  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { 
    this.resetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      verificationCode: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    this.isLoading = true;
    if (this.resetPasswordForm.valid) {
      const email = this.resetPasswordForm.value.email;
      const verificationCode = this.resetPasswordForm.value.verificationCode;
      const newPassword = this.resetPasswordForm.value.newPassword;
  
      this.authService.resetPassword(email, verificationCode, newPassword).subscribe(
        response => {
          setTimeout(() => {
            this.isLoading = false;
            console.log(response);
            this.resetPasswordForm.reset();
            this.successMessage = 'Mot de passe réinitialisé avec succès. Vous pouvez vous connecter.';
            this.errorMessage = '';
            setTimeout(() => {
            this.router.navigate(['/login']);
            }, 3000);
          }, 2000);
        },
        error => {
          console.log(error);
          this.successMessage = '';
          this.errorMessage = 'Erreur lors de la réinitialisation du mot de passe. Veuillez vérifier vos informations.';
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