import { Component, OnInit, AfterViewInit, HostListener, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Livret } from '../../../models/courriers/livret.model';
import { LivretAudit } from '../../../models/courriers/livretAudit.model';
import { LivretService } from '../../../services/courrier/livret.service';
import { MimeService } from '../../../services/mime.service';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlowbiteService } from '../../../services/flowbite.service';
import { UserService } from '../../../services/user.service';
import { LivretAuditService } from '../../../services/courrier/livretAudit.service'; 
import { ReplaceUnderscorePipe } from '../../../shared/pipe/replace-underscore.pipe';

@Component({
  selector: 'app-liste-livret',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, ReactiveFormsModule, ReplaceUnderscorePipe],
  templateUrl: './liste-livret.component.html',
  styleUrls: ['./liste-livret.component.css']
})
export class ListeLivretComponent implements OnInit, AfterViewInit {
  livrets: Livret[] = [];
  livretsAudit: LivretAudit[] = [];
  filteredLivrets: Livret[] = [];
  paginatedLivrets: Livret[] = [];
  selectedType: string = '';
  livretTypes: string[] = ['GUIDE_AUX_USAGERS', 'CIRCUITS_DE_TRAITEMENT', 'MANUELS_DE_PROCEDURES', 'CODES_DE_LA_SOLDE', 'CODES_DES_PENSIONS'];
  searchQuery: string = '';
  searchDate: string = '';
  searchType: string = 'title';
  currentPage: number = 1;
  rowsPerPage: number = 10;
  totalPages: number = 1;
  updateForm: FormGroup;
  isUpdateFormVisible: boolean = false;
  selectedFile!: File | null;
  selectedFileName!: string | null;
  fileType!: string | null;
  userNumero!: string; 
  user: any;
  finaluser: any;
  expandedRowIndex: number | null = null;

  maxFileSize: number = 100 * 1024 * 1024; 
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  isZoomed: boolean = false;
  userId: string | null = null;
  userFilter: string | null = null;
  
  constructor(
    private livretService: LivretService, 
    private mimeService: MimeService, 
    private flowbiteService: FlowbiteService,
    private fb: FormBuilder,
    private userService: UserService, 
    private livretAuditService: LivretAuditService,
    private renderer2: Renderer2
  ) {
    this.updateForm = this.fb.group({
      idCourrier: ['', Validators.required],
      titre: new FormControl({value: '', disabled: true}),
      type: new FormControl({value: '', disabled: true}),
    });
  }

  ngOnInit(): void {
    this.getAllLivrets();
    this.getUserNumero(); 
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


      @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const modalElement = document.querySelector('.form-content') as HTMLElement;
    if (this.isUpdateFormVisible && modalElement && !modalElement.contains(event.target as Node)) {
      this.zoomModal(modalElement, 'update');
    }
  
  }


  zoomModal(element: HTMLElement, modalType: string): void {
    this.isZoomed = true;
  
    setTimeout(() => {
      this.isZoomed = false;
    }, 100); 
  }
  

  
  getUserNumero(): void {
    this.userService.getUserInfo().subscribe(
      data => {
        this.user = data;
        console.log(this.user.username);
        this.userService.getUserByNumero(this.user.username).subscribe(user => {
          this.finaluser = user;
          console.log(this.finaluser.numero);
          this.userNumero = this.finaluser.numero;
        });
      }
    );
  }

  getAllLivrets(): void {
    this.livretService.getAllLivrets().subscribe((data: Livret[]) => {
      this.livrets = data;
      this.filterLivrets();
    });
  }

  filterLivrets(): void {
    this.filteredLivrets = this.livrets.filter(livret => {
      const typeMatches = this.selectedType === '' || livret.type.toString() === this.selectedType;
      let searchMatches = true;
      if (this.searchType === 'title') {
        searchMatches = livret.titre.toLowerCase().includes(this.searchQuery.toLowerCase());
      } else if (this.searchType === 'date' && this.searchDate) {
        const livretDate = new Date(livret.dateInsertion).toISOString().split('T')[0];
        searchMatches = livretDate === this.searchDate;
      }
      return typeMatches && searchMatches;
    });
    this.updatePagination();
  }

  onSearch(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.filterLivrets();
  }

  onDateChange(event: Event): void {
    this.searchDate = (event.target as HTMLInputElement).value;
    this.filterLivrets();
  }

  onSearchTypeChange(event: Event): void {
    this.searchType = (event.target as HTMLSelectElement).value;
    this.filterLivrets();
  }

  onTypeChange(event: Event): void {
    this.selectedType = (event.target as HTMLSelectElement).value;
    this.filterLivrets();
  }

  onRowsPerPageChange(event: Event): void {
    this.rowsPerPage = +(event.target as HTMLSelectElement).value;
    this.currentPage = 1;
    this.updatePagination();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.searchDate = '';
    this.selectedType = '';
    this.searchType = 'title';
    this.getAllLivrets();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredLivrets.length / this.rowsPerPage);
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    this.paginatedLivrets = this.filteredLivrets.slice(start, end);
  }

  downloadLivret(livret: Livret): void {
    const fileType = livret.typeContenue;
    const extension = this.mimeService.getFileExtension(fileType);
    const fileName = `${livret.titre}.${extension.toLowerCase()}`;

    const byteCharacters = atob(livret.contenue);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: fileType });

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  }

  downloadLivretAudit(livretAudit: LivretAudit): void {
    const fileType = livretAudit.typeContenue;
    const extension = this.mimeService.getFileExtension(fileType);
    const fileName = `${livretAudit.titre}.${extension.toLowerCase()}`;

    const byteCharacters = atob(livretAudit.contenue);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: fileType });

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  }

  previewLivret(livret: Livret): void {
    const fileType = livret.typeContenue;
    const byteCharacters = atob(livret.contenue);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: fileType });
    const fileURL = URL.createObjectURL(blob);
    window.open(fileURL);
  }

  openUpdateForm(livret: Livret): void {
    this.updateForm.patchValue({
      idCourrier: livret.idCourrier,
      titre: livret.titre,
      type: livret.type,
    });
    this.isUpdateFormVisible = true;
  }

  closeUpdateForm(): void {
    this.isUpdateFormVisible = false;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];

      // Validate file size
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
      this.errorMessage = ''; 
    }
  } 

  updateLivret(): void { 

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
    
    if (this.updateForm.valid && this.selectedFile) {
      this.closeUpdateForm();
      this.isLoading = true;
      const { idCourrier } = this.updateForm.value;
      const formData = new FormData();
      formData.append('contenue', this.selectedFile);
      formData.append('fileType', this.selectedFile.type);
      formData.append('modifyby', this.userNumero);

      this.livretService.updateLivret(idCourrier, this.selectedFile, this.selectedFile.type, this.userNumero).subscribe(
        response => {
          console.log('Livret modifié avec succès', response);
          setTimeout(() => {
            this.isLoading = false;  
            this.successMessage = 'Pta modifié avec succès!'; 
            this.updateForm.reset(); 
            this.selectedFile = null;
            this.selectedFileName =''; 
            this.fileType = null; 
            this.closeUpdateForm();
            setTimeout(() => {
              this.successMessage = ''; 
            }, 3000);
          }, 2000);  
        }, error => {
          console.error('Erreur lors de la mise à jour du Livret:', error);
          this.isLoading = false; 
          this.errorMessage = 'Une erreur est survenue pendant la mise à jour du Livret. Veuillez essayer de nouveau.';  
          setTimeout(() => {
            this.errorMessage = '';  
          }, 3000);        
        }
      );
    } else {
      console.error('Formulaire invalide ou fichier manquant');
    }
  } 

  toggleRow(index: number, livret: Livret) {
    if (this.expandedRowIndex === index) {
      this.expandedRowIndex = null;
    } else {
      this.expandedRowIndex = index;
    }
    this.livretAuditService.getAllLivretsAuditByCourrierId(livret.idCourrier).subscribe((data: LivretAudit[]) => {
      this.livretsAudit = data;
    });
  }

  closeModalErrorMessage(): void{
    this.errorMessage = '';
  }
}
