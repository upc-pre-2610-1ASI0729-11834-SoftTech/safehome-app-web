import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SafeHomeStore } from '../../../shared/application/safehome.store';


@Component({
  selector: 'app-alerts-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './alerts-page.component.html',
  styleUrl: './alerts-page.component.css'})
export class AlertsPageComponent {
  store = inject(SafeHomeStore);
  private translate = inject(TranslateService);
  filter = signal('all');
  showFilters = signal(true);
  filters = [{ value: 'all', labelKey: 'DEVICES.FILTER_ALL' }, { value: 'active', labelKey: 'STATUS_LABELS.ACTIVE' }, { value: 'critical', labelKey: 'ALERTS.CRITICAL' }, { value: 'medium', labelKey: 'ALERTS.MEDIUM' }, { value: 'info', labelKey: 'ALERTS.INFO' }, { value: 'resolved', labelKey: 'ALERTS.RESOLVED' }];
  filteredEvents = computed(() => this.store.events().filter((event) => this.filter() === 'all' || event.status === this.filter() || event.severity === this.filter()));
  count(value: string): number { return this.store.events().filter((event) => value === 'resolved' ? event.status === 'resolved' : event.severity === value).length; }
  tone(severity: string): string { return severity === 'critical' ? 'danger' : severity === 'medium' ? 'warning' : severity === 'info' ? 'info' : 'success'; }
  icon(type: string): string { return type === 'battery' ? 'bolt' : type === 'camera' ? 'videocam' : type === 'lock' ? 'lock' : type === 'smoke' ? 'local_fire_department' : type === 'gas' ? 'gas_meter' : type === 'water' ? 'water_drop' : 'warning'; }
  statusLabel(status: string): string { return `STATUS_LABELS.${status.toUpperCase()}`; }
  translatedEventTitle(event: { id: number; title: string }): string { const key = `EVENT_TEXT.TITLE_${event.id}`; const value = this.translate.instant(key); return value === key ? event.title : value; }
}

