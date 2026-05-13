import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SafeHomeStore } from '../../../shared/application/safehome.store';
import { DeviceEntity } from '../../domain/model/device.entity';


@Component({
  selector: 'app-device-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './device-detail-page.component.html',
  styleUrl: './device-detail-page.component.css'})
export class DeviceDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  store = inject(SafeHomeStore);
  editing = false;
  sensorSensitivity = 'High';
  nightMode = true;
  autoAlerts = true;
  draft: Partial<DeviceEntity> = {};
  private deviceId = this.route.snapshot.paramMap.get('id') || '';
  device = computed(() => this.store.getDeviceById(this.deviceId));
  relatedEvents = computed(() => this.store.events().filter((event) => event.device === this.device()?.name).slice(0, 4));

  ngOnInit(): void {
    this.store.loadDeviceById(this.deviceId);

    const data = localStorage.getItem(this.configKey());
    if (!data) return;
    try {
      const config = JSON.parse(data) as { sensorSensitivity: string; nightMode: boolean; autoAlerts: boolean };
      this.sensorSensitivity = config.sensorSensitivity ?? this.sensorSensitivity;
      this.nightMode = config.nightMode ?? this.nightMode;
      this.autoAlerts = config.autoAlerts ?? this.autoAlerts;
    } catch {
      this.saveLocalConfig();
    }
  }

  saveLocalConfig(): void {
    localStorage.setItem(this.configKey(), JSON.stringify({ sensorSensitivity: this.sensorSensitivity, nightMode: this.nightMode, autoAlerts: this.autoAlerts }));
  }

  configKey(): string {
    return `safehome-front-v4-device-config-${this.deviceId || 0}`;
  }

  startEdit(item: DeviceEntity): void { this.editing = !this.editing; this.draft = { ...item }; }
  save(current: DeviceEntity): void { this.store.updateDevice({ ...current, ...this.draft } as DeviceEntity); this.editing = false; }
  deleteDevice(id: number | string): void { this.store.deleteDevice(id); this.router.navigateByUrl('/devices'); }
  icon(type: string): string { return type === 'camera' ? 'photo_camera' : type === 'lock' ? 'lock' : type === 'smoke' ? 'local_fire_department' : type === 'window' ? 'sensor_window' : type === 'gas' ? 'gas_meter' : type === 'water' ? 'water_drop' : 'sensors'; }
  eventIcon(type: string): string { return type === 'camera' ? 'videocam' : type === 'intrusion' ? 'warning' : type === 'battery' ? 'battery_alert' : type === 'lock' ? 'lock' : 'info'; }
  statusClass(status: string): string { return status === 'warning' ? 'warning' : status === 'offline' ? 'danger' : status === 'inactive' ? 'info' : 'success'; }
  statusLabel(status: string): string { return `STATUS_LABELS.${status.toUpperCase()}`; }
}
