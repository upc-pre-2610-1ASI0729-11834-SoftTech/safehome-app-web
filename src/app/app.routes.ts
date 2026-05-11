import { Routes } from '@angular/router';
import { WelcomePageComponent } from './shared/presentation/pages/welcome-page.component';

export const routes: Routes = [
  { path: '', component: WelcomePageComponent },
  { path: '**', redirectTo: '' }
];
