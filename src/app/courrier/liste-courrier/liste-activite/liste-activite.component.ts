import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Activite } from '../../../models/courriers/activite.model';
import { ActiviteService } from '../../../services/courrier/activite.service';
import { MimeService } from '../../../services/mime.service';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlowbiteService } from '../../../services/flowbite.service';
import { UserService } from '../../../services/user.service';
import { ReplaceUnderscorePipe } from '../../../shared/pipe/replace-underscore.pipe';

@Component({
  selector: 'app-liste-activite',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, ReactiveFormsModule, ReplaceUnderscorePipe],
  templateUrl: './liste-activite.component.html',
  styleUrls: ['./liste-activite.component.css']
})
export class ListeActiviteComponent implements OnInit, AfterViewInit {
  activites: Activite[] = [];
  filteredActivites: Activite[] = [];
  paginatedActivites: Activite[] = [];
  selectedType: string = '';
  activiteTypes: string[] = ['REFORMES', 'GRANDES_REALISATIONS', 'ANNUELLES', 'SEMESTRIELLES', 'TRIMESTRIELLES', 'MENSUELLES', 'HEBDOMADAIRES'];
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
  selectedDateFilter: string = '';
  filteredActivitesCount: number = 0;
  countToday: number = 0;
  countWeek: number = 0;
  countMonth: number = 0;
  count3Months: number = 0;
  count6Months: number = 0;

  constructor(
    private activiteService: ActiviteService, 
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
    this.getAllActivites();
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

  getAllActivites(): void {
    this.activiteService.getAllActivites().subscribe((data: Activite[]) => {
      this.activites = data;
      this.updateCounts();
      this.filterActivites();
    });
  }

  updateCounts(): void {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOf3Months = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const startOf6Months = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    this.countToday = this.activites.filter(activite => new Date(activite.dateModification || activite.dateInsertion) >= startOfToday).length;
    this.countWeek = this.activites.filter(activite => new Date(activite.dateModification || activite.dateInsertion) >= startOfWeek).length;
    this.countMonth = this.activites.filter(activite => new Date(activite.dateModification || activite.dateInsertion) >= startOfMonth).length;
    this.count3Months = this.activites.filter(activite => new Date(activite.dateModification || activite.dateInsertion) >= startOf3Months).length;
    this.count6Months = this.activites.filter(activite => new Date(activite.dateModification || activite.dateInsertion) >= startOf6Months).length;
  }

  filterActivites(): void {
    this.filteredActivites = this.activites.filter(activite => {
      const typeMatches = this.selectedType === '' || activite.type.toString() === this.selectedType;
      let searchMatches = true;
      if (this.searchType === 'title') {
        searchMatches = activite.titre.toLowerCase().includes(this.searchQuery.toLowerCase());
      } else if (this.searchType === 'date' && this.searchDate) {
        const activiteDate = new Date(activite.dateInsertion).toISOString().split('T')[0];
        searchMatches = activiteDate === this.searchDate;
      }
      return typeMatches && searchMatches;
    });
    this.filteredActivitesCount = this.filteredActivites.length; // Update the count
    this.updatePagination();
  }

  onSearch(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.filterActivites();
  }

  onDateChange(event: Event): void {
    this.searchDate = (event.target as HTMLInputElement).value;
    this.filterActivites();
  }

  onSearchTypeChange(event: Event): void {
    this.searchType = (event.target as HTMLSelectElement).value;
    this.filterActivites();
  }

  onTypeChange(event: Event): void {
    this.selectedType = (event.target as HTMLSelectElement).value;
    this.filterActivites();
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
    this.getAllActivites();
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
    this.totalPages = Math.ceil(this.filteredActivites.length / this.rowsPerPage);
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    this.paginatedActivites = this.filteredActivites.slice(start, end);
  }

  downloadActivite(activite: Activite): void {
    const fileType = activite.typeContenue;
    const extension = this.mimeService.getFileExtension(fileType);
    const fileName = `${activite.titre}.${extension.toLowerCase()}`;

    const byteCharacters = atob(activite.contenue);
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

  previewActivite(activite: Activite): void {
    const fileType = activite.typeContenue;
    const byteCharacters = atob(activite.contenue);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: fileType });
    const fileURL = URL.createObjectURL(blob);
    window.open(fileURL);
  }

  openUpdateForm(activite: Activite): void {
    this.updateForm.patchValue({
      idCourrier: activite.idCourrier,
      titre: activite.titre,
      type: activite.type,
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

  onDateFilterChange(event: Event): void {
    this.selectedDateFilter = (event.target as HTMLSelectElement).value;
    this.filterActivitesByDate();
  }

  filterActivitesByDate(): void {
    const now = new Date();
    let startDate: Date;

    switch (this.selectedDateFilter) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      default:
        startDate = new Date(0); // Default to a very old date if no filter is selected
    }

    this.filteredActivites = this.activites.filter(activite => {
      const activiteDate = new Date(activite.dateModification || activite.dateInsertion);
      return activiteDate >= startDate;
    });

    this.filteredActivitesCount = this.filteredActivites.length; // Update the count
    this.updatePagination();
  }
}
