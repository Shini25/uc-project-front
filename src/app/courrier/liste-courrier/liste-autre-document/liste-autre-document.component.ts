import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AutreDocument } from '../../../models/courriers/autreDocument.model';
import { AutreDocumentService } from '../../../services/courrier/autreDocument.service';
import { MimeService } from '../../../services/mime.service';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlowbiteService } from '../../../services/flowbite.service';
import { UserService } from '../../../services/user.service';
import { ReplaceUnderscorePipe } from '../../../shared/pipe/replace-underscore.pipe';
@Component({
  selector: 'app-liste-autre-document',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, ReactiveFormsModule, ReplaceUnderscorePipe],
  templateUrl: './liste-autre-document.component.html',
  styleUrls: ['./liste-autre-document.component.css']
})
export class ListeAutreDocumentComponent implements OnInit, AfterViewInit {
  autreDocuments: AutreDocument[] = [];
  filteredAutreDocuments: AutreDocument[] = [];
  paginatedAutreDocuments: AutreDocument[] = [];
  selectedType: string = '';
  autreDocumentTypes: string[] = ['CALENDRIER_SOLDE_PENSIONS', 'FEUILLE_DE_ROUTE', 'PIP', 'PSMFP', 'EXECUTION_BUDGETAIRE_DSP_DGEAE', 'CEB', 'PROG_130', 'PV_STAFF', 'PV_INTERNE', 'PV_EXTERNE', 'AUTRES'];
  searchQuery: string = '';
  searchDate: string = '';
  searchType: string = 'title';
  currentPage: number = 1;
  rowsPerPage: number = 10;
  totalPages: number = 1;
  updateForm: FormGroup;
  isUpdateFormVisible: boolean = false;
  selectedFile!: File;
  selectedFileName!: string;
  fileType!: string;
  userNumero!: string; 
  user: any;
  finaluser: any;
  expandedRowIndex: number | null = null;

  constructor(
    private autreDocumentService: AutreDocumentService, 
    private mimeService: MimeService, 
    private flowbiteService: FlowbiteService,
    private fb: FormBuilder,
    private userService: UserService, 
  ) {
    this.updateForm = this.fb.group({
      idCourrier: ['', Validators.required],
      titre: new FormControl({value: '', disabled: true}),
      type: new FormControl({value: '', disabled: true}),
    });
  }

  ngOnInit(): void {
    this.getAllAutreDocuments();
    this.getUserNumero(); 
  }

  ngAfterViewInit(): void {
    this.flowbiteService.loadFlowbite(flowbite => {
      console.log('Flowbite loaded:', flowbite);
    });
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

  getAllAutreDocuments(): void {
    this.autreDocumentService.getAllAutreDocuments().subscribe((data: AutreDocument[]) => {
      this.autreDocuments = data;
      this.filterAutreDocuments();
    });
  }

  filterAutreDocuments(): void {
    this.filteredAutreDocuments = this.autreDocuments.filter(autreDocument => {
      const typeMatches = this.selectedType === '' || autreDocument.type.toString() === this.selectedType;
      let searchMatches = true;
      if (this.searchType === 'title') {
        searchMatches = autreDocument.titre.toLowerCase().includes(this.searchQuery.toLowerCase());
      } else if (this.searchType === 'date' && this.searchDate) {
        const autreDocumentDate = new Date(autreDocument.dateInsertion).toISOString().split('T')[0];
        searchMatches = autreDocumentDate === this.searchDate;
      }
      return typeMatches && searchMatches;
    });
    this.updatePagination();
  }

  onSearch(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.filterAutreDocuments();
  }

  onDateChange(event: Event): void {
    this.searchDate = (event.target as HTMLInputElement).value;
    this.filterAutreDocuments();
  }

  onSearchTypeChange(event: Event): void {
    this.searchType = (event.target as HTMLSelectElement).value;
    this.filterAutreDocuments();
  }

  onTypeChange(event: Event): void {
    this.selectedType = (event.target as HTMLSelectElement).value;
    this.filterAutreDocuments();
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
    this.getAllAutreDocuments();
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
    this.totalPages = Math.ceil(this.filteredAutreDocuments.length / this.rowsPerPage);
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    this.paginatedAutreDocuments = this.filteredAutreDocuments.slice(start, end);
  }

  downloadAutreDocument(autreDocument: AutreDocument): void {
    const fileType = autreDocument.typeContenue;
    const extension = this.mimeService.getFileExtension(fileType);
    const fileName = `${autreDocument.titre}.${extension.toLowerCase()}`;

    const byteCharacters = atob(autreDocument.contenue);
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


  previewAutreDocument(autreDocument: AutreDocument): void {
    const fileType = autreDocument.typeContenue;
    const byteCharacters = atob(autreDocument.contenue);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: fileType });
    const fileURL = URL.createObjectURL(blob);
    window.open(fileURL);
  }

  openUpdateForm(autreDocument: AutreDocument): void {
    this.updateForm.patchValue({
      idCourrier: autreDocument.idCourrier,
      titre: autreDocument.titre,
      type: autreDocument.type,
    });
    this.isUpdateFormVisible = true;
  }

  closeUpdateForm(): void {
    this.isUpdateFormVisible = false;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
      this.selectedFileName = this.selectedFile.name;
      this.fileType = this.selectedFile.type;
    }
  }
}