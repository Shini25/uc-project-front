import { Component, OnInit, AfterViewInit, HostListener, Renderer2 } from '@angular/core';
import { OrganizationalChartService } from '../services/chefs/organizationalChart.service';
import { OrganizationalChart } from '../models/organizationalChart.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MimeService } from '../services/mime.service';
import { FlowbiteService } from '../services/flowbite.service'; 
import { OrganizationalChartAuditService } from '../services/chefs/organizationalChartAudit.service';
import { OrganizationalChartAudit } from '../models/organizationalChartAudit.model';
import { FormControl } from '@angular/forms';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-organizational-chart',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, ReactiveFormsModule],
  templateUrl: './organizational-chart.component.html',
  styleUrl: './organizational-chart.component.css'
})
export class OrganizationalChartComponent implements OnInit, AfterViewInit {
  organizationalChartAudit: OrganizationalChartAudit[] = [];
  organizationalChart: OrganizationalChart[] = [] ;
  selectedOrganizationalChart!: OrganizationalChart | null;
  filteredOrganizationalChart: OrganizationalChart[] = [];
  paginatedOrganizationalChart: OrganizationalChart[] = [];
  selectedType: string = '';
  organizationalChartTypes: string[] = ['MEF','SERVICES', 'DIRECTIONS'];
  currentSousTypes: string[] = [];
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
    private organizationalChartService: OrganizationalChartService, 
    private mimeService: MimeService, 
    private flowbiteService: FlowbiteService,
    private fb: FormBuilder,
    private userService: UserService, 
    private organizationalChartAuditService: OrganizationalChartAuditService,
    private renderer2: Renderer2
  ) {
    this.updateForm = this.fb.group({
      idOrganizationalChart: ['', Validators.required],
      type: new FormControl({value: '', disabled: true}),
      addby: new FormControl({value: '', disabled: true}),
    });

  }

  ngOnInit(): void {
    this.selectedType = 'MEF';
    this.getAllOrganizationalCharts();
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

  toggleRow(index: number, organizationalChart: OrganizationalChart) {
    if (this.expandedRowIndex === index) {
      this.expandedRowIndex = null;
    } else {
      this.expandedRowIndex = index; 
    }
    const idOrganizationalChart = organizationalChart.idOrganizationalChart;
    this.organizationalChartAuditService.getAllOrganizationalChartAudits(idOrganizationalChart).subscribe((data: OrganizationalChartAudit[]) => {
      this.organizationalChartAudit = data;
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

  getAllOrganizationalCharts(): void {
    this.organizationalChartService.getAllOrganizationalCharts().subscribe((data: OrganizationalChart[]) => {
      this.organizationalChart = data.sort((a, b) => new Date(b.createdate).getTime() - new Date(a.createdate).getTime());
      this.filterOrganizationalCharts();
    });
  }

  filterOrganizationalCharts(): void {
    this.filteredOrganizationalChart = this.organizationalChart.filter(organizationalChart => {
      const typeMatches = this.selectedType === '' || organizationalChart.type.toString() === this.selectedType;
      let searchMatches = true;
      if (this.searchDate) {
        const organizationalChartDate = new Date(organizationalChart.createdate).toISOString().split('T')[0];
        searchMatches = organizationalChartDate === this.searchDate;
      }
      return typeMatches && searchMatches;
    });
    this.updatePagination();
  }

  onSearch(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.filterOrganizationalCharts();
  }

  onDateChange(event: Event): void {
    this.searchDate = (event.target as HTMLInputElement).value;
    this.filterOrganizationalCharts();
  }

  onSearchTypeChange(event: Event): void {
    this.searchType = (event.target as HTMLSelectElement).value;
    this.filterOrganizationalCharts();
  }

  onTypeChange(event: Event): void {
    this.selectedType = (event.target as HTMLSelectElement).value;
    this.filterOrganizationalCharts();
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
    this.getAllOrganizationalCharts();
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
    this.totalPages = Math.ceil(this.filteredOrganizationalChart.length / this.rowsPerPage);
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    this.paginatedOrganizationalChart = this.filteredOrganizationalChart.slice(start, end);
  }

  downloadOrganizationalChart(organizationalChart: OrganizationalChart): void {
    const fileType = organizationalChart.filetype;
    const extension = this.mimeService.getFileExtension(fileType);
    const fileName = `${organizationalChart.type}.${extension.toLowerCase()}`;

    const byteCharacters = atob(organizationalChart.content);
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

  downloadOrganizationalChartAudit(organizationalChartAudit: OrganizationalChartAudit): void {
    const fileType = organizationalChartAudit.filetype;
    const extension = this.mimeService.getFileExtension(fileType);
    const fileName = `${organizationalChartAudit.type}.${extension.toLowerCase()}`;

    const byteCharacters = atob(organizationalChartAudit.content);
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

  previewOrganizationalChart(organizationalChart: OrganizationalChart): void {
    const fileType = organizationalChart.filetype;
    const byteCharacters = atob(organizationalChart.content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: fileType });
    const fileURL = URL.createObjectURL(blob);
    window.open(fileURL);
  }

  openUpdateForm(organizationalChart: OrganizationalChart): void {
    this.selectedOrganizationalChart = organizationalChart;
    this.updateForm.patchValue({
      idOrganizationalChart: organizationalChart.idOrganizationalChart,
      type: organizationalChart.type,
      addby: organizationalChart.addby,
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

  updateOrganizationalChart(): void { 
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
      const { idOrganizationalChart } = this.updateForm.value;
      const formData = new FormData();
      formData.append('contenue', this.selectedFile);
      formData.append('fileType', this.selectedFile.type);
      formData.append('modifyby', this.userNumero);

        this.organizationalChartService.updateOrganizationalChart(idOrganizationalChart, this.selectedFile, this.selectedFile.type, this.userNumero).subscribe( 
          response => {
            console.log('Organigramme modifié avec succès', response);
            setTimeout(() => {
              this.isLoading = false;  
              this.successMessage = 'Organigramme modifié avec succès!'; 
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
            console.error('Erreur lors de la mise à jour du Organigramme:', error);
            this.isLoading = false; 
            this.errorMessage = 'Une erreur est survenue pendant la mise à jour du Organigramme. Veuillez essayer de nouveau.';  
            setTimeout(() => {
              this.errorMessage = '';  
            }, 3000);        
          }
        );
      } else {
        console.error('Formulaire invalide ou fichier manquant');
      }
    } 

  closeModalErrorMessage(): void{
    this.errorMessage = '';
  }
}


