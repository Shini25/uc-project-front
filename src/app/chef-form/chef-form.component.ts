import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InfoBaseChefService } from '../services/chefs/infoBaseChef.service';
import { Chefs } from '../models/chefs.model';
import { MatDialog } from '@angular/material/dialog';
import { FlowbiteService } from '../services/flowbite.service';
import { UserService } from '../services/user.service';

export const matchFieldsValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const numero = control.get('numero');
  const contact = control.get('contact');

  if (!numero || !contact) {
    return null;
  }

  return numero.value === contact.value ? null : { fieldsDoNotMatch: true };
};

export const phoneNumberValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (value.startsWith('+261') && value.length === 13) {
    return null; // valid
  }
  return { invalidPhoneNumber: true }; // invalid
};

@Component({
  selector: 'app-chef-form',
  templateUrl: './chef-form.component.html',
  styleUrls: ['./chef-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

  ]
})
export class ChefFormComponent implements AfterViewInit, OnInit {
  chefsForm: FormGroup;
  firstFormGroup: FormGroup;
  selectedPhoto: File | null = null;
  isLinear = true;
  currentStep = 1;
  isLoading: boolean = false;
  successMessage: string = '';
  sousTypeOptions: string[] = [];
  errorMessage: string = '';
  user: any;
  userId: string | null = null;
  userFilter: string | null = null;

  constructor(private fb: FormBuilder, private chefcService: InfoBaseChefService, public dialog: MatDialog, private flowbiteService: FlowbiteService, private userService: UserService) {
    this.chefsForm = this.fb.group({
      numero: ['+261', [Validators.required, phoneNumberValidator]], 
      nom: ['', Validators.required],
      prenoms: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contact: ['+261', [Validators.required, phoneNumberValidator]], 
      photos: this.fb.array([]),
      attributions: this.fb.array([]),
      motDuChefs: this.fb.array([]),
      typeChef: ['', Validators.required],
      sousType:[''],
    });

    this.firstFormGroup = this.fb.group({
      numero:  ['+261', [Validators.required, phoneNumberValidator]], 
      nom: ['', Validators.required],
      prenoms: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contact:  ['+261', [Validators.required, phoneNumberValidator]], 
      photos: this.fb.array([]),
      typeChef: ['', Validators.required],
      sousType: [''] ,
      attributions: this.fb.array([]),
      motDuChefs: this.fb.array([]),
    }, { validators: matchFieldsValidator });
  }

  ngOnInit(): void {
    this.userService.getUserInfo().subscribe(user => {
      this.user = user;
      console.log('User retrieved:', this.user.username);
      this.userId = this.user.username;

      console.log('egs userId', this.userId);
      if(this.user.username ){
        this.userService.getUserByNumero(this.user.username).subscribe(finalUser => {
          this.userFilter = finalUser.accountType;

          console.log('egs userfilter', this.userFilter)
        });
      }
    });
  }

  ngAfterViewInit(): void {
    this.flowbiteService.loadFlowbite(flowbite => {
      console.log('Flowbite loaded:', flowbite);
    });
  }

  get photos(): FormArray {
    return this.firstFormGroup.get('photos') as FormArray;
  }

  get attributions(): FormArray {
    return this.firstFormGroup.get('attributions') as FormArray;
  }

  get motDuChefs(): FormArray {
    return this.firstFormGroup.get('motDuChefs') as FormArray;
  }

  addPhoto(): void {
    this.photos.push(this.fb.group({ photo: ['', Validators.required] }));
  }

  addAttribution(): void {
    this.attributions.push(this.fb.group({
      attribution: ['', Validators.required]
    }));
  }

  addMotDuChef(): void {
    this.motDuChefs.push(this.fb.group({
      paragraphe: ['', Validators.required]
    }));
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedPhoto = input.files[0];
    }
  }

  nextStep(): void {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onSubmit(): void {

    if (this.userFilter === 'SIMPLE') {
      this.isLoading = true;
      setTimeout(() => {
        this.isLoading = false;
        this.errorMessage = 'Vous n\'êtes pas autorisé à effectuer cette action';
        setTimeout(() => {
          this.closeModalErrorMessage();
        }, 2500);
      }, 2000);
      return;
    }

    if (this.firstFormGroup.valid) {
      const typeChef = this.firstFormGroup.get('typeChef')?.value;

      if (typeChef === 'DG') {
        this.firstFormGroup.get('sousType')?.setValue('DGFAG');
      }
  
      this.isLoading = true; 
      const Chef: Chefs = { ...this.firstFormGroup.value };
      const attributions = this.attributions.value.map((attr: any) => attr.attribution);
      const motsDuChef = this.motDuChefs.value.map((mot: any) => mot.paragraphe);
  
      if (this.selectedPhoto) {
        const reader = new FileReader();
        reader.onload = () => {
          console.log('Chef:', Chef);
          console.log('Attributions:', attributions);
          console.log('Mots du Chef:', motsDuChef);
  
          this.chefcService.createChefs(Chef, this.selectedPhoto!, attributions, motsDuChef).subscribe(response => {
            console.log('Chef created', response);
            setTimeout(() => {
              this.isLoading = false;  
              this.successMessage = 'Chef créé avec succès!';  
              setTimeout(() => {
                this.successMessage = '';  
              }, 3000);
            }, 2000);  
          }, error => {
            console.error('Error creating Chef:', error);
            this.isLoading = false;  
            this.errorMessage = 'Erreur lors de la création du Chef. Veuillez réessayer.';  
            setTimeout(() => {
              this.errorMessage = ''; 
            }, 3000);
          });
        };
        reader.readAsDataURL(this.selectedPhoto);
      }
    }
  }

  onTypeChefChange(event: any): void {
    const selectedTypeChef = event.target.value;
    this.updateSousTypeOptions(selectedTypeChef);
  }

  updateSousTypeOptions(typeChef: string): void {
    switch (typeChef) {
      case 'DG':
        this.sousTypeOptions = ['DGFAG'];
        break;
      case 'CELLULES':
        this.sousTypeOptions = [
          'DGEAE_C_AUGURE', 'DGEAE_C_INFORMATIQUE', 'DSP_C_DIGITALISATION', 
          'DSP_C_INFORMATIQUE', 'IPFP', 'DPE_C_SIGPE', 'DB_EPN', 
          'DB_C_INFORMATIQUE_SIIGFP'
        ];
        break;
      case 'CIRCONSCRIPTION_FINANCIERES':
        this.sousTypeOptions = ['NOSYBE', 'SAINTE_MARIE', 'MAROLAMBO', 'MORAMANGA'];
        break;
      case 'SERVICES_REGIONAUX_BUDGET':
        this.sousTypeOptions = [
          'ALAOTRA_MANGORO', 'AMORONI_MANIA', 'ANALAMANGA', 'ANALANJIROFO', 
          'ANDROY', 'ANOSY', 'ATSIMO_ANDREFANA', 'ATSIMO_ATSINANANA', 
          'ATSINANANA', 'BETSIBOKA', 'BOENY', 'BONGOLAVA', 'DIANA', 
          'FITOVINANY', 'HAUTE_MAHATSIATRA', 'ITASY', 'MELAKY', 'IHOROMBE', 
          'MENABE', 'SAVA', 'SOFIA', 'VAKINAKARATRA', 'VATOVAVY'
        ];
        break;
      case 'SERVICES_REGIONAUX_SOLDE_PENSIONS':
        this.sousTypeOptions = [
          'ALAOTRA_MANGORO', 'AMORONI_MANIA', 'ANALAMANGA', 'ANALANJIROFO', 
          'ANDROY', 'ANOSY', 'ATSIMO_ANDREFANA', 'ATSIMO_ATSINANANA', 
          'ATSINANANA', 'BETSIBOKA', 'BOENY', 'BONGOLAVA', 'DIANA', 
          'FITOVINANY', 'HAUTE_MAHATSIATRA', 'ITASY', 'MELAKY', 'IHOROMBE', 
          'MENABE', 'SAVA', 'SOFIA', 'VAKINAKARATRA', 'VATOVAVY'
        ];
        break;
      case 'SERVICES_RATTACHES':
        this.sousTypeOptions = [
          'SAI', 'SAF', 'SCOM', 'SPERS', 'SPE', 'SSEB', 'SCGA', 'CAS', 'SCI'
        ];
        break;
      case 'SERVICES_CENTRAUX_DIRECTION':
        this.sousTypeOptions = [
          'DbSSB', 'DbSRF', 'DbSSSA', 'DbSSPI', 'DgeaeSGEAE', 'DgeaeSCSD', 
          'DgeaeSLE', 'DgeaeSPPAE', 'DpeSSCVA', 'DpeSMATTA', 'DpeSLBA', 
          'DspSMSA', 'DspSCS', 'DspSVSP', 'DspSCPAE', 'DspSODP', 'DspSLP', 
          'DspSSDO'
        ];
        break;
      case 'DIRECTEURS_PRMP':
        this.sousTypeOptions = ['DB', 'DSP', 'PRMP', 'DGEAE', 'DPE'];
        break;
      case 'UC':
        this.sousTypeOptions = ['CHEF', 'MEMBRES'];
        break;
      default:
        this.sousTypeOptions = [];
    }
  }

  removeAttribution() {
    const attributions = this.firstFormGroup.get('attributions') as FormArray;
    if (attributions.length > 0) {
      attributions.removeAt(attributions.length - 1);
    }
  }

  removeMotDuChef() {
    const motDuChefs = this.firstFormGroup.get('motDuChefs') as FormArray;
    if (motDuChefs.length > 0) {
      motDuChefs.removeAt(motDuChefs.length - 1);
    }
  }

  closeModalErrorMessage(): void{
    this.errorMessage = '';
  }
}