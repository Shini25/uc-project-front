import { Component } from '@angular/core';
import { TableauDeBordService } from '../../../services/courrier/tableauDeBord.service';
import { TableauDeBord } from '../../../models/courriers/accesReserve.model';
import { MimeService } from '../../../services/mime.service';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { ReplaceUnderscorePipe } from '../../../shared/pipe/replace-underscore.pipe';

@Component({
  selector: 'app-liste-tableau-de-bord-eb',
  standalone: true,
  imports: [CommonModule, DatePipe, ReplaceUnderscorePipe],
  templateUrl: './liste-tableau-de-bord-eb.component.html',
  styleUrl: './liste-tableau-de-bord-eb.component.css'
})
export class ListeTableauDeBordEBComponent {
  tableauDeBords: TableauDeBord[] = [];
  filteredTableauDeBords: TableauDeBord[] = [];
  paginatedTableauDeBords: TableauDeBord[] = [];
  selectedType: string = '';
  tableauDeBordTypes: string[] = ['TABLEAU_DE_BORD', 'EXECUTION_DAF', 'EXECUTION_SSB', 'EXECUTION_DGEAE_DSP'];
  searchQuery: string = '';
  searchDate: string = '';
  searchType: string = 'title';
  currentPage: number = 1;
  rowsPerPage: number = 10;
  totalPages: number = 1;

  constructor(private tableauDeBordService: TableauDeBordService, private mimeService: MimeService) {}

  ngOnInit(): void {
    this.getAllTableauDeBords();
  }

  getAllTableauDeBords(): void {
    this.tableauDeBordService.getAllTableauDeBords().subscribe((data: TableauDeBord[]) => {
      this.tableauDeBords = data;
      this.filterTableauDeBords();
    });
  }

  filterTableauDeBords(): void {
    this.filteredTableauDeBords = this.tableauDeBords.filter(tableauDeBord => {
      // Check tableauDeBord type first
      const typeMatches = this.selectedType === '' || tableauDeBord.accesReserveType.toString() === this.selectedType;
  
      let searchMatches = true;
      if (this.searchType === 'title') {
        searchMatches = tableauDeBord.titre.toLowerCase().includes(this.searchQuery.toLowerCase());
      } else if (this.searchType === 'date' && this.searchDate) {
        const tableauDeBordDate = new Date(tableauDeBord.dateInsertion).toISOString().split('T')[0];
        searchMatches = tableauDeBordDate === this.searchDate;
      }
  
      return typeMatches && searchMatches;
    });
  
    this.updatePagination();
  }
  

  onSearch(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.filterTableauDeBords();
  }

  onDateChange(event: Event): void {
    this.searchDate = (event.target as HTMLInputElement).value;
    this.filterTableauDeBords();
  }

  onSearchTypeChange(event: Event): void {
    this.searchType = (event.target as HTMLSelectElement).value;
    this.filterTableauDeBords();
  }

  onTypeChange(event: Event): void {
    this.selectedType = (event.target as HTMLSelectElement).value;
    this.filterTableauDeBords();
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
    this.getAllTableauDeBords();
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
    this.totalPages = Math.ceil(this.filteredTableauDeBords.length / this.rowsPerPage);
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    this.paginatedTableauDeBords = this.filteredTableauDeBords.slice(start, end);
  }

  downloadTableauDeBord(tableauDeBord: TableauDeBord): void {
    const fileType = tableauDeBord.typeContenue;
    const extension = this.mimeService.getFileExtension(fileType);
    const fileName = `${tableauDeBord.titre}.${extension.toLowerCase()}`;

    const byteCharacters = atob(tableauDeBord.contenue);
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

  previewTableauDeBord(tableauDeBord: TableauDeBord): void {
    const fileType = tableauDeBord.typeContenue;
    const byteCharacters = atob(tableauDeBord.contenue);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: fileType });
    const fileURL = URL.createObjectURL(blob);
    window.open(fileURL);
  }

}
