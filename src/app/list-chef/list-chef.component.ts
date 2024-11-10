import { Component, OnInit, HostListener, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoBaseChefService } from '../services/chefs/infoBaseChef.service';
import { photoService } from '../services/chefs/photo.service';
import { attributionService } from '../services/chefs/attribution.service';
import { Chefs } from '../models/chefs.model';
import { RouterLink } from '@angular/router';
import { motDuChefService } from '../services/chefs/motDuChef.service';
import { FlowbiteService } from '../services/flowbite.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserSessionService } from '../services/userSessionService';
import { Router } from '@angular/router';
import { OrganizationalChartService } from '../services/chefs/organizationalChart.service';
import { UserService } from '../services/user.service';
@Component({
  selector: 'app-list-chef',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule

  ],
  templateUrl: './list-chef.component.html',
  styleUrls: ['./list-chef.component.css']
})
export class ListChefComponent implements OnInit {
  organizationalChartForm: FormGroup;
  chefs: Chefs[] = [];
  visibleChefs: Chefs[] = [];
  filteredChefs: Chefs[] = [];
  searchActive: boolean = false;
  firstParagraphs: { [key: string]: string } = {};
  selectedType: string = 'DIRECTEURS_PRMP';
  chefTypes: string[] = ['DG', 'CELLULES', 'CIRCONSCRIPTIONS_FINANCIERES', 'DIRECTEURS_PRMP', 'SERVICES_CENTRAUX_DES_DIRECTIONS', 'SERVICES_REGIONAUX_BUDGET', 'SERVICES_REGIONAUX_SOLDE_PENSIONS', 'SERVICES_RATTACHES'];
  isAttributionModalVisible = false;
  isOrganiationalchartModalVisible = false;
  isZoomedOrganizational = false;  
  isZoomedAttributions = false;
  selectedChef: Chefs | null = null;
  selectedChefId: Chefs | null = null;

  selectedFile: File | null = null;
  selectedFileName: string | null = null;
  fileType: string | null = null;

  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  user: any;
  userId: string | null = null;
  userFilter: string | null = null;

  constructor(
    private chefService: InfoBaseChefService,
    private chefPhotoService: photoService,
    private chefAttributionService: attributionService,
    private organizationalChartService: OrganizationalChartService,
    private router: Router,
    private fb: FormBuilder,
    private chefMotDuChefService: motDuChefService,
    private flowbiteService: FlowbiteService,
    private userSessionService: UserSessionService,
    private renderer: Renderer2,
    private userService: UserService
  ) {

    const userId = this.userSessionService.getNumero();
    this.organizationalChartForm = this.fb.group({
      title: ['', Validators.required],
      type: ['', Validators.required],
      addBy: [userId]
    });
  }

  ngOnInit(): void {
    this.flowbiteService.loadFlowbite(flowbite => {
      console.log('Flowbite loaded:', flowbite);
    });
    this.fetchChefsByType(this.selectedType);

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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const modalElementOrganizational = document.querySelector('.form-content') as HTMLElement;
    if (this.isOrganiationalchartModalVisible && modalElementOrganizational && !modalElementOrganizational.contains(event.target as Node)) {
      this.zoomModal(modalElementOrganizational, 'organizational');
    }
  
    const modalElementAttributions = document.querySelector('.form-content-attributions') as HTMLElement;
    if (this.isAttributionModalVisible && modalElementAttributions && !modalElementAttributions.contains(event.target as Node)) {
      this.zoomModal(modalElementAttributions, 'attribution');
    }
  }
  

  zoomModal(element: HTMLElement, modalType: string): void {
    if (modalType === 'organizational') {
      this.isZoomedOrganizational = true;
    } else if (modalType === 'attribution') {
      this.isZoomedAttributions = true;
    }
  
    setTimeout(() => {
      if (modalType === 'organizational') {
        this.isZoomedOrganizational = false;
      } else if (modalType === 'attribution') {
        this.isZoomedAttributions = false;
      }
    }, 100);
  }
  


  fetchChefsByType(type: string): void {
    this.chefService.getChefsByTypeDeChef(type).subscribe((data: Chefs[]) => {
      this.chefs = data;

      console.log(  'anandramana chefs' ,this.chefs);
      this.updateVisibleChefs();
      this.chefs.forEach(chef => {
        this.fetchFirstParagraph(chef.id);
      });
    });
  }

  fetchFirstParagraph(chefId: string): void {
    this.chefMotDuChefService.getMotDuChefsByChef(chefId).subscribe(motDuChefs => {
      if (motDuChefs.length > 0) {
        this.firstParagraphs[chefId] = motDuChefs[0];
      }
    });
  }

  updateVisibleChefs(): void {
    this.visibleChefs = this.searchActive ? this.filteredChefs : this.chefs;
    this.visibleChefs.forEach(chef => {
      this.chefPhotoService.getPhotosByChef(chef.id).subscribe(photos => {
        chef.photos = photos;
      });
      this.chefAttributionService.getAttributionsByChef(chef.id).subscribe(attributions => {
        chef.attributions = attributions.map(attr => ({ attribution: attr }));
      });
    });
  }

  onSearch(event: Event) {
    const input = (event.target as HTMLInputElement).value.toLowerCase();
    if (input) {
      this.filteredChefs = this.chefs.filter(chef => 
        (chef.nom + ' ' + chef.prenoms).toLowerCase().includes(input)
      );
      this.searchActive = true;
    } else {
      this.filteredChefs = [];
      this.searchActive = false;
    }
    this.updateVisibleChefs();
  }


  selectChef(chef: Chefs): void {
    this.chefPhotoService.getPhotosByChef(chef.id).subscribe(photos => {
      chef.photos = photos;
    });
    this.chefAttributionService.getAttributionsByChef(chef.id).subscribe(attributions => {
      chef.attributions = attributions.map(attr => ({ attribution: attr }));
    });
    this.visibleChefs = [chef];
    this.filteredChefs = []; 
    this.searchActive = false;
  }

  getDisplayChefs(): Chefs[] {
    return this.searchActive ? this.filteredChefs : this.visibleChefs;
  }

  onTypeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const type = selectElement.value;
    this.selectedType = type;
    this.fetchChefsByType(type);
  }

  openAttributionModal(chef: Chefs): void {
    this.selectedChef = chef;
    this.isAttributionModalVisible = true;
  }

  openOrganiationalchartModal(): void {
    this.isOrganiationalchartModalVisible = true;
  }

  closeModal(): void {
    this.isAttributionModalVisible = false;
    this.isOrganiationalchartModalVisible = false;
    this.selectedChef = null;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
      this.selectedFileName = this.selectedFile.name;
      this.fileType = this.selectedFile.type;
    }
  }

  onSubmitOrganizationalChart(): void {
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
    
    if (this.organizationalChartForm.valid && this.selectedFile) {
      this.isLoading = true;
      const { type, addBy, title } = this.organizationalChartForm.value;

      this.organizationalChartService.createOrganizationalChart(type, title, this.selectedFile, addBy, this.fileType!).subscribe(
        response => {
          console.log('Organizational chart created successfully', response);
          setTimeout(() => {
            this.isLoading = false;  
            this.successMessage = 'Organigramme ajouté avec succès!'; 
            setTimeout(() => {
              this.successMessage = ''; 
            }, 3000);
          }, 2000);  
        }, error => {
          console.error('Error creating Chef:', error);
          this.isLoading = false; 
          this.errorMessage = 'Erreur lors de l\'ajout de l\'organigramme. Veuillez réessayer.';  
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
