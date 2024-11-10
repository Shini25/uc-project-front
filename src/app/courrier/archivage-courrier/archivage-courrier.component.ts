import { Component, EventEmitter, Output, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CourrierService } from '../../services/courrier/courrier.service';
import { Location } from '@angular/common';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-archivage-courrier',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './archivage-courrier.component.html',
  styleUrls: ['./archivage-courrier.component.css']
})
export class ArchivageCourrierComponent implements OnInit {
  @Output() courrierArchived = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef;


  courrierForm: FormGroup;
  selectedFile: File |  null = null;
  selectedFileName: string | null = null;
  fileType: string | null = null;
  selectedDocumentType: string = 'LIVRET'; 
  selectedPtaType: string | null = null;
  allowedFileTypes: string[] = ['application/pdf', 'image/jpeg', 'image/png'];
  maxFileSize: number = 100 * 1024 * 1024; // 100 MB
  user: any;
  successMessage: string | null = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  userFilter: string | null = null; 
  userId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private courrierService: CourrierService,
    private location: Location,
    private userService: UserService,
    private authService: AuthService
  ) {

    this.courrierForm = this.fb.group({
      titre: ['', Validators.required],
      type: ['', Validators.required],
      userId: [''],
      sousType: ['']
    });
  }

  ngOnInit(): void {

    if(this.isAuthenticated()){
    this.userService.getUserInfo().subscribe(user => {
      this.user = user;
      this.userId = this.user.username;
      if(this.user.username ){
        this.userService.getUserByNumero(this.user.username).subscribe(finalUser => {
          this.userFilter = finalUser.accountType;

          console.log('egs userfilter', this.userFilter)
        });
      }
    });
  }
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  private resetFileInput(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onPtaTypeChange(event: Event): void {
    const input = event.target as HTMLSelectElement;
    if (input && input.value) {
      this.selectedPtaType = input.value;
      
      if (['MEF', 'DSP', 'DGBF'].includes(this.selectedPtaType)) {
        this.courrierForm.patchValue({ sousType: this.selectedPtaType });
      } else {
        this.courrierForm.patchValue({ sousType: '' }); 
      }
    }
  }
  
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      if (file.size > this.maxFileSize) {
        console.error('File size exceeds limit');
        this.errorMessage = 'File size exceeds the 10 MB limit.';
        this.selectedFile = null;
        this.selectedFileName = null;
        this.fileType = null;
        return;
      }

      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.fileType = file.type;
      this.errorMessage = null; 
    }
  }

  onDocumentTypeChange(event: Event): void {
    const input = event.target as HTMLSelectElement;
    if (input && input.value) {
      this.selectedDocumentType = input.value;
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
    
    if (this.courrierForm.valid && this.selectedFile) {
      
      this.isLoading = true;
      const { titre, type, sousType } = this.courrierForm.value;
      const formData = new FormData();
      formData.append('titre', titre);
      formData.append('contenu', this.selectedFile);
      formData.append('type', type);
      formData.append('typeDeContenu', this.fileType!);
      formData.append('userId', this.userId!);
      formData.append('sousType', sousType);

      const handleResponse = (successMessage: string, errorMessage: string) => {
        return {
          next: (response: any) => {
            setTimeout(() => {
              this.isLoading = false;
              this.successMessage = successMessage;
              this.courrierForm.reset();
              this.selectedFile = null;
              this.selectedFileName =''; 
              this.fileType = null; 

              this.resetFileInput();

              setTimeout(() => {
                this.successMessage = '';
              }, 3000);
            }, 2000);
          },
          error: () => {
            setTimeout(() => {
              this.isLoading = false;
              this.errorMessage = errorMessage;
              this.courrierForm.reset();
              setTimeout(() => {
                this.errorMessage = '';
              }, 3000);
            }, 2000);
          }
        };
      };

      switch (this.selectedDocumentType) {
        case 'LIVRET':
          this.courrierService.creationLivret(titre, this.selectedFile, type, this.fileType!, this.userId!)
            .subscribe(handleResponse('Livret créé avec succès', 'Erreur lors de la création du livret'));
          break;
        case 'PTA':
          this.courrierService.creationPta(titre, this.selectedFile, type, sousType, this.fileType!, this.userId!)
            .subscribe(handleResponse('Pta créé avec succès', 'Erreur lors de la création du PTA'));
          break;
        case 'ACTIVITE':
          this.courrierService.createActivite(titre, this.selectedFile, type, this.fileType!, this.userId!)
            .subscribe(handleResponse('Activité créée avec succès', 'Erreur lors de la création de l\'activité'));
          break;
        case 'TEXTE':
          this.courrierService.createTexte(titre, this.selectedFile, type, this.fileType!, this.userId!)
            .subscribe(handleResponse('Texte créé avec succès', 'Erreur lors de la création du texte'));
          break;
        case 'AUTRE_DOCUMENT':
          this.courrierService.createAutreDocument(titre, this.selectedFile, type, this.fileType!, this.userId!)
            .subscribe(handleResponse('Document créé avec succès', 'Erreur lors de la création du document'));
          break;
        case 'TABLEAU_DE_BORD':
          this.courrierService.createTableauDeBord(titre, this.selectedFile, type, this.fileType!, this.userId!)
            .subscribe(handleResponse('Document créé avec succès', 'Erreur lors de la création du document'));
          break;
        default:
          console.error('Type de document inconnu');
      }
    } else {
      console.error('Formulaire invalide ou fichier manquant');
    }
  }
  

  goBack(): void {
    this.location.back();
  }

  closeModalErrorMessage(): void{
    this.errorMessage = '';
  }
}
