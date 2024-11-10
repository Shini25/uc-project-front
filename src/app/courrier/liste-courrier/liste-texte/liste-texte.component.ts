import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Texte } from '../../../models/courriers/texte.model';
import { TexteService } from '../../../services/courrier/texte.service';
import { MimeService } from '../../../services/mime.service';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlowbiteService } from '../../../services/flowbite.service';
import { UserService } from '../../../services/user.service';
import { ReplaceUnderscorePipe } from '../../../shared/pipe/replace-underscore.pipe';

@Component({
  selector: 'app-liste-texte',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, ReactiveFormsModule, ReplaceUnderscorePipe],
  templateUrl: './liste-texte.component.html',
  styleUrls: ['./liste-texte.component.css']
})
export class ListeTexteComponent implements OnInit, AfterViewInit {
  textes: Texte[] = [];
  filteredTextes: Texte[] = [];
  paginatedTextes: Texte[] = [];
  selectedType: string = '';
  texteTypes: string[] = ['TEXTES_REGLEMENTAIRES', 'REMARQUES_OBSERVATIONS', 'LETTRES_NOTES', 'SGAP', 'PROJET_DE_TEXTE', 'AUTRES'];
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
    private texteService: TexteService, 
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
    this.getAllTextes();
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

  getAllTextes(): void {
    this.texteService.getAllTextes().subscribe((data: Texte[]) => {
      this.textes = data;
      this.filterTextes();
    });
  }

  filterTextes(): void {
    this.filteredTextes = this.textes.filter(texte => {
      const typeMatches = this.selectedType === '' || texte.type.toString() === this.selectedType;
      let searchMatches = true;
      if (this.searchType === 'title') {
        searchMatches = texte.titre.toLowerCase().includes(this.searchQuery.toLowerCase());
      } else if (this.searchType === 'date' && this.searchDate) {
        const texteDate = new Date(texte.dateInsertion).toISOString().split('T')[0];
        searchMatches = texteDate === this.searchDate;
      }
      return typeMatches && searchMatches;
    });
    this.updatePagination();
  }

  onSearch(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.filterTextes();
  }

  onDateChange(event: Event): void {
    this.searchDate = (event.target as HTMLInputElement).value;
    this.filterTextes();
  }

  onSearchTypeChange(event: Event): void {
    this.searchType = (event.target as HTMLSelectElement).value;
    this.filterTextes();
  }

  onTypeChange(event: Event): void {
    this.selectedType = (event.target as HTMLSelectElement).value;
    this.filterTextes();
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
    this.getAllTextes();
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
    this.totalPages = Math.ceil(this.filteredTextes.length / this.rowsPerPage);
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    this.paginatedTextes = this.filteredTextes.slice(start, end);
  }

  downloadTexte(texte: Texte): void {
    const fileType = texte.typeContenue;
    const extension = this.mimeService.getFileExtension(fileType);
    const fileName = `${texte.titre}.${extension.toLowerCase()}`;

    const byteCharacters = atob(texte.contenue);
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


  previewTexte(texte: Texte): void {
    const fileType = texte.typeContenue;
    const byteCharacters = atob(texte.contenue);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: fileType });
    const fileURL = URL.createObjectURL(blob);
    window.open(fileURL);
  }

  openUpdateForm(texte: Texte): void {
    this.updateForm.patchValue({
      idCourrier: texte.idCourrier,
      titre: texte.titre,
      type: texte.type,
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