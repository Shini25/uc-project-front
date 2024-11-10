import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FlowbiteService } from '../services/flowbite.service';
import { PtasListComponent } from './ptas-list/ptas-list.component';
import { UserListComponent } from '../user/user-list/user-list.component';
import { ChartComponent } from '../chart/chart.component';
import { MeetingweekComponent } from '../meeting/meetingweek/meetingweek.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [PtasListComponent, UserListComponent, ChartComponent, MeetingweekComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

    constructor(
        private router: Router,
        private flowbiteService: FlowbiteService
    ) {}

    ngOnInit(): void {
      this.flowbiteService.loadFlowbite(flowbite => {
        console.log('Flowbite loaded:', flowbite);
      });
    }
}
