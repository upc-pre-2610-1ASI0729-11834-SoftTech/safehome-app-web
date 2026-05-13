import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SafeHomeStore } from '../../../shared/application/safehome.store';


@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css'})
export class DashboardPageComponent {
  store = inject(SafeHomeStore);
  private translate = inject(TranslateService);

  
  firstName(): string {
    return this.store.user().name.split(' ')[0] || 'User';
  }

  
  lastAlertLabel(): string {
    return this.store.pendingAlerts() ? this.store.events()[0]?.createdAt || this.translate.instant('DASHBOARD.NO_ALERTS') : this.translate.instant('DASHBOARD.NO_ALERTS');
  }

  
  tone(severity: string): string {
    if (severity === 'critical') return 'danger';
    if (severity === 'medium') return 'warning';
    if (severity === 'info') return 'info';
    return 'success';
  }

  
  translatedEventTitle(id: number, title: string): string {
    const key = `EVENT_TEXT.TITLE_${id}`;
    const value = this.translate.instant(key);
    return value === key ? title : value;
  }
}
