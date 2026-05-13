import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SafeHomeStore } from '../../../shared/application/safehome.store';


@Component({
  selector: 'app-alert-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './alert-detail-page.component.html',
  styleUrl: './alert-detail-page.component.css'})
export class AlertDetailPageComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  store = inject(SafeHomeStore);
  private translate = inject(TranslateService);
  event = computed(() => this.store.events().find((event) => event.id === Number(this.route.snapshot.paramMap.get('id'))));

  deleteEvent(id: number): void { this.store.deleteEvent(id); this.router.navigateByUrl(this.backPath()); }
  backPath(): string { return this.router.url.startsWith('/events') ? '/events' : '/alerts'; }

  downloadEvidence(item: { id: number; title: string; device: string; zone: string; createdAt: string; status: string }): void {
    const content = `SafeHome event evidence\nEvent: ${item.title}\nDevice: ${item.device}\nZone: ${item.zone}\nDate: ${item.createdAt}\nStatus: ${item.status}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `safehome-event-${item.id}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  severityIcon(severity: string): string { return severity === 'critical' ? 'warning' : severity === 'medium' ? 'report_problem' : severity === 'info' ? 'info' : 'check_circle'; }
  relatedDeviceId(name: string): number | string { return this.store.devices().find((device) => device.name === name)?.id || 1; }
  tone(severity: string): string { return severity === 'critical' ? 'danger' : severity === 'medium' ? 'warning' : severity === 'info' ? 'info' : 'success'; }
  statusLabel(status: string): string { return `STATUS_LABELS.${status.toUpperCase()}`; }
  translatedEventTitle(event: { id: number; title: string }): string { const key = `EVENT_TEXT.TITLE_${event.id}`; const value = this.translate.instant(key); return value === key ? event.title : value; }
  translatedEventDescription(event: { id: number; description: string }): string { const key = `EVENT_TEXT.DESCRIPTION_${event.id}`; const value = this.translate.instant(key); return value === key ? event.description : value; }
}
