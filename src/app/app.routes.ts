import { Routes } from '@angular/router';
import { HomeComponent } from './accueil/home.component';

//auth 
import { PageNotFoundComponentComponent } from './page-introuvable/page-not-found-component.component';
import { AccountCreatedDialogComponent } from './user/create-account/account-created-dialog/account-created-dialog.component';
import { CreateAccountComponent } from './user/create-account/create-account.component';
import { MotDuChefComponent } from './list-chef/motduchef/motduchef.component';
import { ArchivageCourrierComponent } from './courrier/archivage-courrier/archivage-courrier.component';
import { LoginComponent } from './user/login/login.component';
import { ListChefComponent } from './list-chef/list-chef.component';
import { ChefFormComponent } from './chef-form/chef-form.component';
import { PlanifierReunionComponent } from './meeting/planifier-reunion/planifier-reunion.component';
import { ListeReunionComponent } from './meeting/liste-reunion/liste-reunion.component';
import { ListeLivretComponent } from './courrier/liste-courrier/liste-livret/liste-livret.component';
import { ListeTexteComponent } from './courrier/liste-courrier/liste-texte/liste-texte.component';
import { ListePtaComponent } from './courrier/liste-courrier/liste-pta/liste-pta.component';
import { ListeAutreDocumentComponent } from './courrier/liste-courrier/liste-autre-document/liste-autre-document.component';
import { ListeActiviteComponent } from './courrier/liste-courrier/liste-activite/liste-activite.component';
import { ListeTableauDeBordEBComponent } from './courrier/liste-courrier/liste-tableau-de-bord-eb/liste-tableau-de-bord-eb.component';
import { AuthGuard } from './services/auth.guard';
import { UcPresentaionComponent } from './uc-presentaion/uc-presentaion.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PtasListComponent } from './dashboard/ptas-list/ptas-list.component';
import { TableauDeBordListComponent } from './dashboard/tableau-de-bord-list/tableau-de-bord-list.component';
import { ActiviteListComponent } from './dashboard/activite-list/activite-list.component';
import { UpdateChefComponent } from './update-chef/update-chef.component';
import { OrganizationalChartComponent } from './organizational-chart/organizational-chart.component';
import { UserListComponent } from './user/user-list/user-list.component';
import { ChartComponent } from './chart/chart.component';
import { MeetingweekComponent } from './meeting/meetingweek/meetingweek.component';
import { AuthAdminGuard } from './services/authAdmin.guard';
import { AccesDeniedComponent } from './user/acces-denied/acces-denied.component';
import { ForgotPasswordComponent } from './user/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './user/reset-password/reset-password.component';
import { ListResponsablesAuditComponent } from './list-chef/list-responsables-audit/list-responsables-audit.component';

export const routes: Routes = [
    {
      path: 'home',
      component: HomeComponent
    },
    { path: 'auth/liste-livret', component: ListeLivretComponent },

    { path: 'oubli-mot-de-passe', component: ForgotPasswordComponent },
    { path: 'reinitialiser-mot-de-passe', component: ResetPasswordComponent },

    {
      path: 'auth',
      canActivate: [AuthGuard],
      children: [
        { path: 'liste-chef/enregistrement', component: ChefFormComponent },
        { path: 'liste-chef', component: ListChefComponent },
        { path: 'liste-pta', component: ListePtaComponent },
        { path: 'chef-motduchef/:chefId', component: MotDuChefComponent },
        { path: 'responsablesAudit/:sousType', component: ListResponsablesAuditComponent },
        { path: 'archivage-courrier', component: ArchivageCourrierComponent },
        { path: 'liste-reunion/planification', component: PlanifierReunionComponent },
        { path: 'liste-reunion', component: ListeReunionComponent },
        { path: 'liste-texte', component: ListeTexteComponent },
        { path: 'liste-autre-document', component: ListeAutreDocumentComponent },
        { path: 'liste-activite', component: ListeActiviteComponent },
        { path: 'liste-suivi-execution', component: ListeTableauDeBordEBComponent },
        { path: 'uc-presentation', component: UcPresentaionComponent },
        { path: 'ptas-list', component: PtasListComponent },
        { path: 'tableau-de-bord-list', component: TableauDeBordListComponent },
        { path: 'liste-activite-chef', component: ActiviteListComponent},
        { path: 'modification', component: UpdateChefComponent},
        { path: 'organigramme', component: OrganizationalChartComponent},
        { path: 'liste-utilisateur', component: UserListComponent},
        { path: 'chart', component: ChartComponent},
        { path: 'semaine-reunion', component: MeetingweekComponent},
        { path: 'acces-denied', component: AccesDeniedComponent}
      ]
    },
    {
      path: 'dashboard', component: DashboardComponent,
      canActivate: [AuthAdminGuard]
    },
    {
      path: 'create-account',
      component: CreateAccountComponent
    },
    {
      path: 'login',
      component: LoginComponent
    },
    {
      path: 'compte-cree-avec-succes',
      component: AccountCreatedDialogComponent
    },
    {
      path: '**',
      component: PageNotFoundComponentComponent
    },
  ];
  