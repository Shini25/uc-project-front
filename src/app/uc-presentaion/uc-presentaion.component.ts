import { Component, OnInit, HostListener, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoBaseChefService } from '../services/chefs/infoBaseChef.service';
import { photoService } from '../services/chefs/photo.service';
import { attributionService } from '../services/chefs/attribution.service';
import { Chefs } from '../models/chefs.model';
import { RouterModule, Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { motDuChefService } from '../services/chefs/motDuChef.service';
import { FlowbiteService } from '../services/flowbite.service';

@Component({
  selector: 'app-uc-presentaion',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterLink
  ],
  templateUrl: './uc-presentaion.component.html',
  styleUrl: './uc-presentaion.component.css'
})


export class UcPresentaionComponent implements OnInit {
  chefs: Chefs[] = [];
  visibleChefs: Chefs[] = [];
  filteredChefs: Chefs[] = [];
  searchActive: boolean = false;
  firstParagraphs: { [key: string]: string } = {};
  selectedType: string = 'UC';
  chefTypes: string[] = ['UC'];
  isAttributionModalVisible = false;
  isOrganiationalchartModalVisible = false;
  selectedChef: Chefs | null = null;
  selectedChefId: Chefs | null = null;
  isZoomedOrganizational = false;  
  isZoomedAttributions = false;
  selectedFile: File | null = null;
  selectedFileName: string | null = null;
  fileType: string | null = null;

  constructor(
    private chefService: InfoBaseChefService,
    private chefPhotoService: photoService,
    private chefAttributionService: attributionService,
    private router: Router,
    private chefMotDuChefService: motDuChefService,
    private flowbiteService: FlowbiteService,
    private renderer: Renderer2
  ) {
  }

  ngOnInit(): void {
    this.flowbiteService.loadFlowbite(flowbite => {
      console.log('Flowbite loaded:', flowbite);
    });
    this.fetchChefsByType(this.selectedType);

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
    console.log('egs type', type);
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


  // Organigramme
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
      this.selectedFileName = this.selectedFile.name;
      this.fileType = this.selectedFile.type;
    }
  }

  getUcChefs() {
    return this.getDisplayChefs().filter(chef => chef.sousType === 'CHEF');
  }
  getUcMembers() {
    return this.getDisplayChefs().filter(chef => chef.sousType === 'MEMBRES');
  }

}
