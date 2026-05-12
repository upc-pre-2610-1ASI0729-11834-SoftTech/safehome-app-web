import { Routes } from '@angular/router';
import { AppShellComponent } from './shared/presentation/components/app-shell.component';
import { AuthPageComponent } from './iam/presentation/pages/auth-page.component';
import { DashboardPageComponent } from './monitoring/presentation/pages/dashboard-page.component';
import { HomeStatusPageComponent } from './monitoring/presentation/pages/home-status-page.component';
import { AlertsPageComponent } from './monitoring/presentation/pages/alerts-page.component';
import { AlertDetailPageComponent } from './monitoring/presentation/pages/alert-detail-page.component';
import { EventsPageComponent } from './monitoring/presentation/pages/events-page.component';
import { HistoryPageComponent } from './monitoring/presentation/pages/history-page.component';
import { DevicesPageComponent } from './devices/presentation/pages/devices-page.component';
import { DeviceFormPageComponent } from './devices/presentation/pages/device-form-page.component';
import { DeviceDetailPageComponent } from './devices/presentation/pages/device-detail-page.component';
import { ProfilePageComponent } from './profiles/presentation/pages/profile-page.component';
import { SettingsPageComponent } from './settings/presentation/pages/settings-page.component';
import { SupportPageComponent } from './support/presentation/pages/support-page.component';
import { SupportMessagePageComponent } from './support/presentation/pages/support-message-page.component';


export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: AuthPageComponent, data: { mode: 'login' } },
  { path: 'register', component: AuthPageComponent, data: { mode: 'register' } },
  { path: 'forgot-password', component: AuthPageComponent, data: { mode: 'forgot' } },
  { path: 'account-created', component: AuthPageComponent, data: { mode: 'success' } },
  {
    path: '',
    component: AppShellComponent,
    children: [
      { path: 'dashboard', component: DashboardPageComponent },
      { path: 'home-status', component: HomeStatusPageComponent },
      { path: 'devices', component: DevicesPageComponent },
      { path: 'devices/new', component: DeviceFormPageComponent },
      { path: 'devices/:id', component: DeviceDetailPageComponent },
      { path: 'alerts', component: AlertsPageComponent },
      { path: 'alerts/:id', component: AlertDetailPageComponent },
      { path: 'events', component: EventsPageComponent },
      { path: 'events/:id', component: AlertDetailPageComponent },
      { path: 'history', component: HistoryPageComponent },
      { path: 'profile', component: ProfilePageComponent },
      { path: 'settings', component: SettingsPageComponent },
      { path: 'support', component: SupportPageComponent },
      { path: 'support/message', component: SupportMessagePageComponent }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
