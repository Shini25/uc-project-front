import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User_account } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ]
})
export class CreateAccountComponent {
  createAccountForm: FormGroup;
  accountStatuses = ['ONLINE', 'OFFLINE'];
  accountTypes = ['ADMIN', 'SIMPLE', 'OTHER'];
  accountStates = ['ACTIVE', 'INACTIVE'];

  successMessage: string | null = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
  ) {
    this.createAccountForm = this.fb.group({
      numero: ['', [Validators.required, Validators.minLength(8)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
      ]],
      email: ['', [Validators.required, Validators.email]],
      accountType: ['', Validators.required],
      accountStatus: ['OFFLINE'],
      accountState: ['INACTIVE']
    });
  }

  onSubmit() {
    if (this.createAccountForm.valid) {

      this.isLoading = true;
      const numeroControl = this.createAccountForm.get('numero');

      if (numeroControl) {
        const numero = numeroControl.value;
        this.userService.checkUsernameExists(numero).subscribe({
          next: (exists) => {
            if (exists) {
              setTimeout(() => {
                this.errorMessage = 'Ce numéro existe déjà';
                setTimeout(() => {
                  this.errorMessage = '';
                }, 2500);
                this.isLoading = false;
              }, 2500);
            } else {
              const user: User_account = this.createAccountForm.value;
              this.userService.addUser(user).subscribe({
                next: (response) => {
                  this.createAccountForm.reset();
                  this.createAccountForm.patchValue({
                    accountStatus: 'OFFLINE',
                    accountState: 'INACTIVE'
                  });
                  setTimeout(() => {
                    this.isLoading = false;
                    this.successMessage = 'Compte créé avec succès, en attente de validation';
                    setTimeout(() => {
                      this.successMessage = '';
                    }, 3000);
                  }, 2500);
                },
                error: (error) => {
                  this.isLoading = false;
                  this.errorMessage = 'Erreur lors de la création du compte';
                  setTimeout(() => {
                    this.errorMessage = '';
                  }, 2500);
                }
              });
            }
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error checking numero', error.message);
          }
        });
      }
    } else {
      this.isLoading = false;
      console.log('Form Invalid:', this.createAccountForm);
    }
  }

  closeModalErrorMessage(): void{
    this.errorMessage = '';
  }
}