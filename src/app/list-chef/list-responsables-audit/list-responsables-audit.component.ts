import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { motDuChefService } from '../../services/chefs/motDuChef.service';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { ResponsableAudit } from '../../models/responsableAudit.model';
import { InfoBaseChefService } from '../../services/chefs/infoBaseChef.service';

@Component({
  selector: 'app-list-responsables-audit',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './list-responsables-audit.component.html',
  styleUrl: './list-responsables-audit.component.css'
})
export class ListResponsablesAuditComponent implements OnInit {
  responsablesAudit: ResponsableAudit[] = [];
  sousType!: string;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private infoBaseChefService: InfoBaseChefService
  ) {}

  ngOnInit(): void {
    this.sousType = this.route.snapshot.paramMap.get('sousType')!;
    this.infoBaseChefService.getResponsablesAuditBySousType(this.sousType).subscribe(responsablesAudit => {
      this.responsablesAudit = responsablesAudit;
      const test = this.responsablesAudit[0];
      console.log('test', test.photo);
    });
  }
}
