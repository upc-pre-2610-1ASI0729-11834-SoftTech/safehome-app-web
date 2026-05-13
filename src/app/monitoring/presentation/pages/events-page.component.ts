import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SafeHomeStore } from '../../../shared/application/safehome.store';


@Component({
  selector: 'app-events-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './events-page.component.html',
  styleUrl: './events-page.component.css'})
export class EventsPageComponent {
  store = inject(SafeHomeStore);
  private translate = inject(TranslateService);
  paused = signal(false);
  showFilters = signal(false);
  filter = signal('all');
  limit = signal(6);
  filteredEvents = computed(() => this.store.events().filter((event) => this.filter() === 'all' || event.status === this.filter() || event.severity === this.filter()));
  visibleEvents = computed(() => this.filteredEvents().slice(0, this.limit()));

  criticalCount(): number { return this.store.events().filter((event) => event.severity === 'critical').length; }
  tone(severity: string): string { return severity === 'critical' ? 'danger' : severity === 'medium' ? 'warning' : severity === 'info' ? 'info' : 'success'; }
  zoneTone(status: string): string { return status === 'critical' ? 'danger' : status === 'warning' ? 'warning' : 'success'; }
  statusLabel(status: string): string { return `STATUS_LABELS.${status.toUpperCase()}`; }
  zoneStatusLabel(status: string): string { return status === 'safe' ? 'STATUS_LABELS.SAFE' : status === 'critical' ? 'STATUS_LABELS.CRITICAL' : 'STATUS_LABELS.WARNING'; }
  eventIcon(type: string): string { return type === 'camera' ? 'videocam' : type === 'battery' ? 'battery_alert' : type === 'lock' ? 'lock' : type === 'system' ? 'bolt' : 'warning'; }
  translatedEventTitle(id: number, title: string): string { const key = `EVENT_TEXT.TITLE_${id}`; const value = this.translate.instant(key); return value === key ? title : value; }
}
