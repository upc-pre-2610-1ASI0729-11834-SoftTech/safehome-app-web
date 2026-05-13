import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SafeHomeStore } from '../../../shared/application/safehome.store';


@Component({
  selector: 'app-home-status-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './home-status-page.component.html',
  styleUrl: './home-status-page.component.css'})
export class HomeStatusPageComponent {
  store = inject(SafeHomeStore);
  private translate = inject(TranslateService);
  toast = signal('');
  risks = [
    { icon: 'security', titleKey: 'STATUS.RISK_INTRUSION', textKey: 'STATUS.RISK_OK' },
    { icon: 'local_fire_department', titleKey: 'STATUS.RISK_SMOKE', textKey: this.store.warningDevices() ? 'STATUS.RISK_WARNING' : 'STATUS.RISK_OK' },
    { icon: 'gas_meter', titleKey: 'STATUS.RISK_GAS', textKey: 'STATUS.RISK_OK' },
    { icon: 'water_drop', titleKey: 'STATUS.RISK_WATER', textKey: 'STATUS.RISK_OK' },
    { icon: 'bolt', titleKey: 'STATUS.RISK_ELECTRICITY', textKey: 'STATUS.RISK_OK' }
  ];

  
  exportReport(): void {
    const rows = [
      ['Metric', 'Value'],
      ['Active devices', `${this.store.activeDevices()}/${this.store.devices().length}`],
      ['Monitored zones', String(this.store.zones().length)],
      ['Uptime', this.store.uptime()],
      ['Pending alerts', String(this.store.pendingAlerts())]
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    this.download(csv, 'safehome-status-report.csv');
    this.toast.set(this.translate.instant('MESSAGES.EXPORTED'));
    setTimeout(() => this.toast.set(''), 2000);
  }

  
  download(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  zoneClass(status: string): string { return status === 'critical' ? 'danger' : status === 'warning' ? 'warning' : 'success'; }
  zoneStatusLabel(status: string): string { return status === 'safe' ? 'STATUS_LABELS.SAFE' : status === 'critical' ? 'STATUS_LABELS.CRITICAL' : 'STATUS_LABELS.WARNING'; }
  tone(severity: string): string { return severity === 'critical' ? 'danger' : severity === 'medium' ? 'warning' : severity === 'info' ? 'info' : 'success'; }
  translatedEventTitle(id: number, title: string): string { const key = `EVENT_TEXT.TITLE_${id}`; const value = this.translate.instant(key); return value === key ? title : value; }
}
