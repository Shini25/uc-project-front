import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { motDuChefService } from '../../services/chefs/motDuChef.service';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';

@Component({
  selector: 'app-motduchef',
  templateUrl: './motduchef.component.html',
  styleUrls: ['./motduchef.component.css'],
  standalone: true,
  imports: [
    CommonModule,
  ]
})
export class MotDuChefComponent implements OnInit {
  chefId!: string;
  chefNom!: string;
  chefPrenoms!: string;
  motDuChefs: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private motDuChefService: motDuChefService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.chefId = this.route.snapshot.paramMap.get('chefId')!;
    this.chefNom = this.route.snapshot.queryParamMap.get('nom')!;
    this.chefPrenoms = this.route.snapshot.queryParamMap.get('prenoms')!;
    this.motDuChefService.getMotDuChefsByChef(this.chefId).subscribe(motDuChefs => {
      this.motDuChefs = motDuChefs;
    });
  }

  goBack(): void {
    this.location.back();
  }
}