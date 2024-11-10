import { Component, OnInit, LOCALE_ID, HostListener, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { RouterLink } from '@angular/router';
import { MeetingService } from '../../services/meeting/meeting.service';
import { InfoMeetingBase } from '../../models/infoMeetingBase.model';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserSessionService } from '../../services/userSessionService';
import { MimeService } from '../../services/mime.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MeetingOrganizersService } from '../../services/meeting/meetingOrganizers.service';
import { MeetingObservationsService } from '../../services/meeting/meetingObservations.service';
import { MeetingParticipantsService } from '../../services/meeting/meetingParticipants.service';
import { LogisticsService } from '../../services/meeting/logistics.service';
import { SendMailService } from '../../services/sendMail.service';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { Observable, throwError, forkJoin, of } from 'rxjs';
import { ParticipantOrganizerDTO } from '../../models/participantOrganizerDTO.model';
import { UserService } from '../../services/user.service';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { SendWhatsAppService } from '../../services/sendWhatsAppService';

registerLocaleData(localeFr);

@Component({
  selector: 'app-meetingweek',
  standalone: true,
  imports: [CommonModule, MatButtonModule, RouterLink, RouterModule, ReactiveFormsModule],
  templateUrl: './meetingweek.component.html',
  styleUrl: './meetingweek.component.css'
})
export class MeetingweekComponent implements OnInit {

  meetings: InfoMeetingBase[] = [];
  filteredMeetings: InfoMeetingBase[] = [];
  paginatedMeetings: InfoMeetingBase[] = [];
  searchQuery: string = '';
  searchDate: string = '';
  searchType: string = 'objet';
  displayedColumns: string[] = ['objet', 'date', 'details'];
  today: Date = new Date();
  updateForm: FormGroup;
  selectedFile: File | null = null;
  selectedFileName: string | null = null;
  fileType!: string | null;
  isModalVisible: boolean = false;
  isLoading: boolean = false;
  successMessage: string = '';
  expandedRowIndex: number | null = null;
  logistique: string[] = [];
  observation: string[] = [];
  responsables: ParticipantOrganizerDTO[] = [];
  participants: ParticipantOrganizerDTO[] = [];
  currentPage: number = 1;
  rowsPerPage: number = 10;
  totalPages: number = 1;
  isSendMailVisible: boolean = true; 
  isLoadingEmailSpinner: boolean = false; // Separated loading spinner for email
  isLoadingWhatsAppSpinner: boolean = false; // Separated loading spinner for WhatsApp
  errorMessage: string | null = null;
  allowedFileTypes: string[] = ['application/pdf', 'image/jpeg', 'image/png'];
  maxFileSize: number = 100 * 1024 * 1024; 
  isZoomed: boolean = false;
  user: any;
  invalidEmails: string[] = [];
  meetingReminderMessage: string | null = null;

  constructor(
    private meetingService: MeetingService, 
    private router: Router,
    private fb: FormBuilder,
    private userSessionService: UserSessionService,
    private mimeService: MimeService,
    private meetingOrganizersService: MeetingOrganizersService,
    private meetingParticipantsService: MeetingParticipantsService,
    private meetingObservationsService: MeetingObservationsService,
    private logistiqueService: LogisticsService,
    private sendMailService: SendMailService,
    private renderer2: Renderer2,
    private userService: UserService,
    private sendWhatsAppService: SendWhatsAppService
    
  ) {
    const userId = this.userSessionService.getNumero();
    this.updateForm = this.fb.group({
      modifyby: [userId],
      meetingId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchMeetings();

    this.userService.getUserInfo().subscribe(user => {
      this.user = user;
      console.log('User retrieved:', this.user.username);
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const modalElement = document.querySelector('.form-content') as HTMLElement;
    if (this.isModalVisible && modalElement && !modalElement.contains(event.target as Node)) {
      this.zoomModal(modalElement, 'update');
    }
  }

  zoomModal(element: HTMLElement, modalType: string): void {
    this.isZoomed = true;
  
    setTimeout(() => {
      this.isZoomed = false;
    }, 100); 
  }


  fetchMeetings(): void {
    this.meetingService.getAllMeetings().subscribe((data: InfoMeetingBase[]) => {
      this.meetings = data.sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());
      this.filterMeetings();
    });
  }

  viewDetails(meetingId: number): void {
    this.router.navigate(['auth/details-reunion', meetingId]);
  }

  isPastDate(meetingDate: string): boolean {
    return new Date(meetingDate) >= this.today;
  }


  previewAttendanceSheet(fileContent: string, fileType: string): void {
    const byteCharacters = atob(fileContent);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: fileType });
    const fileURL = URL.createObjectURL(blob);
    window.open(fileURL);
  }

  fetchLogistique(meetingId: number): void {
    this.logistiqueService.getLogisticsByMeeting(meetingId).subscribe((data: string[]) => {
      this.logistique = data;
    });
  }

  fetchObservation(meetingId: number): void {
    this.meetingObservationsService.getObservationsByMeeting(meetingId).subscribe((data: string[]) => {
      this.observation = data;
    });
  }

  fetchResponsables(meetingId: number): void {
      this.meetingOrganizersService.getOrganizersByMeeting(meetingId).subscribe((data: ParticipantOrganizerDTO[]) => {
      this.responsables = data;
      console.log('Responsables:', this.responsables);
    });
  }
  
  fetchParticipants(meetingId: number): void {
    this.meetingParticipantsService.getParticipantsByMeeting(meetingId).subscribe((data: ParticipantOrganizerDTO[]) => {
      this.participants = data;
      console.log('Participants andramana:', this.participants);
    });
  }

  getResponsables(meetingId: number): Observable<ParticipantOrganizerDTO[]> {
    return this.meetingOrganizersService.getOrganizersByMeeting(meetingId);
  }

  getParticipants(meetingId: number): Observable<ParticipantOrganizerDTO[]> {
    return this.meetingParticipantsService.getParticipantsByMeeting(meetingId);
  }



  toggleRow(index: number, meeting: InfoMeetingBase): void { // Add this method
    if (this.expandedRowIndex === index) {
      this.expandedRowIndex = null;
    } else {
      this.expandedRowIndex = index;
    }
    this.fetchDataForExpandedRow(meeting.id);
  }
  //fetching data for the expanded row
  fetchDataForExpandedRow(meetingId: number): void {
    this.fetchLogistique(meetingId);
    this.fetchObservation(meetingId);
    this.fetchResponsables(meetingId);
    this.fetchParticipants(meetingId);
  }

  isToday(meetingDate: string): boolean {
    const today = new Date();
    const date = new Date(meetingDate);
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  onSearch(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.filterMeetings();
  }

  onDateChange(event: Event): void {
    this.searchDate = (event.target as HTMLInputElement).value;
    this.filterMeetings();
  }

  onSearchTypeChange(event: Event): void {
    this.searchType = (event.target as HTMLSelectElement).value;
    this.filterMeetings();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.searchDate = '';
    this.searchType = 'objet';
    this.filterMeetings();
  }

  filterMeetings(): void {
    this.filteredMeetings = this.meetings.filter(meeting => {
      let searchMatches = true;
      if (this.searchType === 'objet') {
        searchMatches = meeting.objet.toLowerCase().includes(this.searchQuery.toLowerCase());
      } else if (this.searchType === 'date' && this.searchDate) {
        const meetingDate = new Date(meeting.meetingDate).toISOString().split('T')[0];
        searchMatches = meetingDate === this.searchDate;
      }
      return searchMatches && this.isThisWeek(meeting.dateCreation);
    });
    this.updatePagination();
  }

  onRowsPerPageChange(event: Event): void {
    this.rowsPerPage = +(event.target as HTMLSelectElement).value;
    this.currentPage = 1;
    this.updatePagination();
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
    this.totalPages = Math.ceil(this.filteredMeetings.length / this.rowsPerPage);
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    this.paginatedMeetings = this.filteredMeetings.slice(start, end);
  }

  isThisWeek(dateCreation: string): boolean {
    const date = new Date(dateCreation);
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    return date >= startOfWeek && date <= endOfWeek;
  }

  sendReminderEmail(meeting: any): Observable<void> {
    const { objet, meetingDate: date, location: lieu, id: meetingId, reminder } = meeting;
    const addby = this.user.username;

    if (!navigator.onLine) {
        console.error('No internet connection. Emails cannot be sent.');
        return throwError(() => new Error('No internet connection.'));
    }

    if (reminder) {
        this.meetingReminderMessage = `La réunion de cette semaine a déjà été rappelée.`;
        setTimeout(() => this.meetingReminderMessage = '', 5000);
        return of(void 0); 
    }

    return forkJoin({
        participants: this.getParticipants(meetingId),
        responsables: this.getResponsables(meetingId)
    }).pipe(
        switchMap(({ participants, responsables }) => {
            const emailObservables: Observable<string>[] = [];

            participants.forEach((participant: ParticipantOrganizerDTO) => {
                emailObservables.push(
                    this.sendMailService.sendReminderEmail(
                        participant.email,
                        objet,
                        date,
                        lieu,
                        addby,
                        meetingId
                    ).pipe(
                        tap(() => console.log(`Email sent to participant: ${participant.email}`)),
                        catchError(err => {
                            console.error(`Error sending email to participant: ${participant.email}`, err);
                            this.invalidEmails.push(participant.email);
                            return of(`Failed to send email to participant: ${participant.email}`);
                        })
                    )
                );
            });

            responsables.forEach((responsable: ParticipantOrganizerDTO) => {
                emailObservables.push(
                    this.sendMailService.sendReminderEmail(
                        responsable.email,
                        objet,
                        date,
                        lieu,
                        addby,
                        meetingId
                    ).pipe(
                        tap(() => console.log(`Email sent to responsable: ${responsable.email}`)),
                        catchError(err => {
                            console.error(`Error sending email to responsable: ${responsable.email}`, err);
                            this.invalidEmails.push(responsable.email);
                            return of(`Failed to send email to responsable: ${responsable.email}`);
                        })
                    )
                );
            });

            return forkJoin(emailObservables).pipe(
                tap(() => console.log('All reminder emails processed for meeting:', objet)),
                map(() => void 0)
            );
        }),
        catchError(err => {
            console.error('Error in sendReminderEmail:', err);
            return throwError(() => err);
        })
    );
}

sendGlobalReminderEmails(): void {
    this.isLoadingEmailSpinner = true;
    let completedRequests = 0;
    const meetingsThisWeek = this.paginatedMeetings.filter(meeting => this.isThisWeek(meeting.dateCreation));
    const totalRequests = meetingsThisWeek.length;
    let hasError = false;
    const allInvalidEmails: string[] = [];  // Stocker tous les emails invalides

    if (!navigator.onLine) {
        this.hideSpinnerWithErrorMessage('Vérifiez votre connexion internet.', null);
        return;
    }

    if (totalRequests === 0) {
        this.hideSpinnerWithSuccessMessage('Aucune réunion à traiter.');
        return;
    }

    meetingsThisWeek.forEach(meeting => {
        this.sendReminderEmail(meeting).subscribe({
            next: () => {
                completedRequests++;
                if (completedRequests === totalRequests && !hasError) {
                    if (allInvalidEmails.length > 0) {
                        this.hideSpinnerWithErrorMessage('Certains e-mails n\'ont pas pu être envoyés.', null);
                        console.log('Invalid emails:', allInvalidEmails);  // Afficher les e-mails invalides
                    } else {
                        this.hideSpinnerWithSuccessMessage('Tous les mails ont été envoyés avec succès!');
                    }
                }
            },
            error: (error) => {
                hasError = true;
                completedRequests++;
                if (completedRequests === totalRequests) {
                    this.hideSpinnerWithErrorMessage('Certains e-mails n\'ont pas pu être envoyés.', error);
                }
            }
        });
    });
}

sendReminderWhatsApp(meeting: any): Observable<void> {
  const { objet, meetingDate: date, location: lieu, id: meetingId, reminder } = meeting;
  const addby = this.user.username;

  if (!navigator.onLine) {
      console.error('No internet connection. WhatsApp messages cannot be sent.');
      return throwError(() => new Error('No internet connection.'));
  }

  // if (reminder) {
  //     this.meetingReminderMessage = `La réunion de cette semaine a déjà été rappelée.`;
  //     setTimeout(() => this.meetingReminderMessage = '', 5000);
  //     return of(void 0); 
  // }

  return forkJoin({
      participants: this.getParticipants(meetingId),
      responsables: this.getResponsables(meetingId)
  }).pipe(
      switchMap(({ participants, responsables }) => {
          const messageObservables: Observable<string>[] = [];

          participants.forEach((participant: ParticipantOrganizerDTO) => {
              messageObservables.push(
                  this.sendWhatsAppService.sendReminderWhatsApp(
                      participant.phoneNumber,  // Utilisez le numéro de téléphone
                      objet,
                      date,
                      lieu,
                      addby,
                      meetingId
                  ).pipe(
                      tap(() => console.log(`WhatsApp message sent to participant: ${participant.phoneNumber}`)),
                      catchError(err => {
                          console.error(`Error sending WhatsApp message to participant: ${participant.phoneNumber}`, err);
                          return of(`Failed to send WhatsApp message to participant: ${participant.phoneNumber}`);
                      })
                  )
              );
          });

          responsables.forEach((responsable: ParticipantOrganizerDTO) => {
              messageObservables.push(
                  this.sendWhatsAppService.sendReminderWhatsApp(
                      responsable.phoneNumber,
                      objet,
                      date,
                      lieu,
                      addby,
                      meetingId
                  ).pipe(
                      tap(() => console.log(`WhatsApp message sent to responsable: ${responsable.phoneNumber}`)),
                      catchError(err => {
                          console.error(`Error sending WhatsApp message to responsable: ${responsable.phoneNumber}`, err);
                          return of(`Failed to send WhatsApp message to responsable: ${responsable.phoneNumber}`);
                      })
                  )
              );
          });

          return forkJoin(messageObservables).pipe(
              tap(() => console.log('All reminder WhatsApp messages processed for meeting:', objet)),
              map(() => void 0)
          );
      }),
      catchError(err => {
          console.error('Error in sendReminderWhatsApp:', err);
          return throwError(() => err);
      })
  );
}

sendGlobalReminderWhatsApp(): void {
  this.isLoadingWhatsAppSpinner = true;
  let completedRequests = 0;
  const meetingsThisWeek = this.paginatedMeetings.filter(meeting => this.isThisWeek(meeting.dateCreation));
  const totalRequests = meetingsThisWeek.length;
  let hasError = false;
  const allInvalidNumbers: string[] = []; 

  if (!navigator.onLine) {
      this.hideSpinnerWithErrorMessage('Vérifiez votre connexion internet.', null);
      return;
  }

  if (totalRequests === 0) {
      this.hideSpinnerWithSuccessMessage('Aucune réunion à traiter.');
      return;
  }

  meetingsThisWeek.forEach(meeting => {
      this.sendReminderWhatsApp(meeting).subscribe({
          next: () => {
              completedRequests++;
              if (completedRequests === totalRequests && !hasError) {
                  if (allInvalidNumbers.length > 0) {
                      this.hideSpinnerWithErrorMessage('Certains messages WhatsApp n\'ont pas pu être envoyés.', null);
                      console.log('Invalid numbers:', allInvalidNumbers);  // Afficher les numéros invalides
                  } else {
                      this.hideSpinnerWithSuccessMessage('Tous les messages WhatsApp ont été envoyés avec succès!');
                  }
              }
          },
          error: (error) => {
              hasError = true;
              completedRequests++;
              if (completedRequests === totalRequests) {
                  this.hideSpinnerWithErrorMessage('Certains messages WhatsApp n\'ont pas pu être envoyés.', error);
              }
          }
      });
  });
}

hideSpinnerWithSuccessMessage(message: string): void {
    setTimeout(() => {
        this.isLoadingEmailSpinner = false;
        this.isLoadingWhatsAppSpinner = false;
        this.successMessage = message;
        setTimeout(() => this.successMessage = '', 3000);
    }, 2000);
}

hideSpinnerWithErrorMessage(message: string, error: any): void {
    setTimeout(() => {
        this.isLoadingEmailSpinner = false;
        this.isLoadingWhatsAppSpinner = false;
        this.errorMessage = message;  // Afficher l'erreur dans `errorMessage`
        console.error('Error:', error);
        setTimeout(() => this.errorMessage = '', 3000);
    }, 2000);
}
    
  toggleSendMailVisibility(): void {
    this.isSendMailVisible = !this.isSendMailVisible;
  }
}
