import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SafeHomeStore } from '../../../shared/application/safehome.store';
import { SecurityEventEntity } from '../../domain/model/security-event.entity';


@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './history-page.component.html',
  styleUrl: './history-page.component.css'})
export class HistoryPageComponent {
  store = inject(SafeHomeStore);
  private translate = inject(TranslateService);
  search = '';
  status = 'all';
  priority = 'all';
  device = 'all';
  toast = signal('');

  
  deviceNames(): string[] { return Array.from(new Set(this.store.events().map((event) => event.device))); }

  
  filteredEvents(): SecurityEventEntity[] {
    const search = this.search.trim().toLowerCase();
    return this.store.events().filter((event) => {
      const text = `${event.title} ${event.description} ${event.device} ${event.zone} ${event.createdAt}`.toLowerCase();
      return (!search || text.includes(search)) &&
        (this.status === 'all' || event.status === this.status) &&
        (this.priority === 'all' || event.severity === this.priority) &&
        (this.device === 'all' || event.device === this.device);
    });
  }

  
  exportData(): void {
    const rows = this.filteredEvents().map((event) => [event.createdAt, this.translatedEventTitle(event), event.device, event.zone, this.translate.instant(this.priorityLabel(event.severity)), this.translate.instant(this.statusLabel(event.status)), this.translatedEventDescription(event)]);
    const csv = [['Date', 'Event', 'Device', 'Location', 'Priority', 'Status', 'Description'], ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'safehome-event-history.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    this.toast.set(this.translate.instant('MESSAGES.EXPORTED'));
    setTimeout(() => this.toast.set(''), 2000);
  }

  
  tone(severity: string): string { return severity === 'critical' ? 'danger' : severity === 'medium' ? 'warning' : severity === 'info' ? 'info' : 'success'; }

  
  statusLabel(status: string): string { return `STATUS_LABELS.${status.toUpperCase()}`; }

  
  priorityLabel(severity: string): string { return severity === 'critical' ? 'PRIORITY.CRITICAL' : severity === 'medium' ? 'PRIORITY.MEDIUM' : severity === 'info' ? 'PRIORITY.INFO' : 'PRIORITY.LOW'; }

  
  translatedEventTitle(event: SecurityEventEntity): string { const key = `EVENT_TEXT.TITLE_${event.id}`; const value = this.translate.instant(key); return value === key ? event.title : value; }

  
  translatedEventDescription(event: SecurityEventEntity): string { const key = `EVENT_TEXT.DESCRIPTION_${event.id}`; const value = this.translate.instant(key); return value === key ? event.description : value; }
}
