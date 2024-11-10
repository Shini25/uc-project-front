import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CourrierService } from '../services/courrier/courrier.service';
import { TexteService } from '../services/courrier/texte.service';
import { ActiviteService } from '../services/courrier/activite.service';
import { LivretService } from '../services/courrier/livret.service';
import { PtaService } from '../services/courrier/pta.service';
import { TableauDeBordService } from '../services/courrier/tableauDeBord.service';
import { AutreDocumentService } from '../services/courrier/autreDocument.service';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { FlowbiteService } from '../services/flowbite.service';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [],
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit, OnDestroy {
  private chart: any;
  private ApexCharts: any;

  constructor(
    private courrierService: CourrierService,
    private texteService: TexteService,
    private activiteService: ActiviteService,
    private livretService: LivretService,
    private ptaService: PtaService,
    private tableauDeBordService: TableauDeBordService,
    private autreDocumentService: AutreDocumentService,
    private flowbiteService: FlowbiteService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

ngOnInit(): void {
  if (isPlatformBrowser(this.platformId)) {
    this.loadApexChartsLibrary().then(() => {
      this.loadChartData();

      const observer = new MutationObserver(() => {
        this.loadChartData();
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });

      this.flowbiteService.loadFlowbite(flowbite => {
        console.log('Flowbite loaded:', flowbite);
      });
    });
  }
}

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private async loadApexChartsLibrary(): Promise<void> {
    const module = await import('apexcharts');
    this.ApexCharts = module.default;
  }

  loadChartData(): void {
    const isDarkMode = document.documentElement.classList.contains('dark');
    const colors = isDarkMode
      ? ['#f59e0b', '#fef08a', '#6b7280', '#4b5563', '#0369a1', '#1e3a8a'] 
      : ['#d97706', '#fef08a', '#9CA3AF', '#d4d4d8', '#0c4a6e', '#1d4ed8'];
  
    const labelColor = isDarkMode ? 'white' : 'black'; 
  
    forkJoin({
      activites: this.activiteService.getAllActivites(),
      autreDocuments: this.autreDocumentService.getAllAutreDocuments(),
      livrets: this.livretService.getAllLivrets(),
      ptas: this.ptaService.getAllPtas(),
      tableauDeBords: this.tableauDeBordService.getAllTableauDeBords(),
      textes: this.texteService.getAllTextes()
    }).subscribe({
      next: (results) => {
        const activiteCount = results.activites.length;
        const autreDocumentCount = results.autreDocuments.length;
        const livretCount = results.livrets.length;
        const ptaCount = results.ptas.length;
        const tableauDeBordCount = results.tableauDeBords.length;
        const texteCount = results.textes.length;
  
        const totalCount = activiteCount + autreDocumentCount + livretCount + ptaCount + tableauDeBordCount + texteCount;
  
        const totalCountElement = document.getElementById('totalCount');
        if (totalCountElement) {
          totalCountElement.textContent = totalCount.toString();
        }
  
        if (this.chart) {
          this.chart.destroy();
        }
  
        const options = {
          series: [activiteCount, autreDocumentCount, livretCount, ptaCount, tableauDeBordCount, texteCount],
          chart: {
            type: 'donut',
            height: 320
          },
          labels: ['Activités', 'Autre Documents', 'Livrets', 'PTAs', 'Tableau de Bord', 'Textes'],
          colors: colors,
          stroke: {
            show: true,
            width: 1,
            colors: isDarkMode ? ['#1e3a8a'] : ['#ffffff'] 
          },
          plotOptions: {
            pie: {
              donut: {
                size: '70%',
                labels: {
                  show: true,
                  name: {
                    show: true,
                    fontSize: '16px', 
                    color: labelColor
                  },
                  value: {
                    show: true,
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: labelColor
                  },
                  total: {
                    show: true,
                    label: 'Total',
                    fontSize: '22px', 
                    color: labelColor,
                    formatter: () => totalCount.toString(),
                    style: {
                      fontSize: '22px',
                      fontWeight: 'bold',
                      colors: [labelColor] 
                    }
                  }
                }
              }
            }
          },
          legend: {
            position: 'bottom',
            labels: {
              colors: labelColor
            }
          },
          dataLabels: {
            enabled: true,
            style: {
              fontSize: '14px',
              fontWeight: 'bold',
              colors: ['#ffffff']
            },
            dropShadow: {
              enabled: false  
            },
            formatter: function (val: number) {
              return val.toFixed(1) + '%';  
            }
          }
        };
  
        this.chart = new this.ApexCharts(document.querySelector('#donut-chart'), options);
        this.chart.render();
      },
      
      error: (err) => {
        console.error('Error fetching data:', err);
      }
    });
  }
}  