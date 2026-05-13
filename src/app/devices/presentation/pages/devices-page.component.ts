import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SafeHomeStore } from '../../../shared/application/safehome.store';


type DeviceFilter = 'all' | 'motion' | 'camera' | 'lock' | 'active' | 'inactive';

@Component({
  selector: 'app-devices-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './devices-page.component.html',
  styleUrl: './devices-page.component.css'
})
export class DevicesPageComponent {
  store = inject(SafeHomeStore);

  private translate = inject(TranslateService);

  filter = signal<DeviceFilter>('all');
  currentPage = signal(1);
  toast = signal('');

  readonly pageSize = 4;

  filterOptions: { value: DeviceFilter; labelKey: string }[] = [
    { value: 'all', labelKey: 'DEVICES.FILTER_ALL' },
    { value: 'motion', labelKey: 'DEVICES.FILTER_SENSORS' },
    { value: 'camera', labelKey: 'DEVICES.FILTER_CAMERAS' },
    { value: 'lock', labelKey: 'DEVICES.FILTER_LOCKS' },
    { value: 'active', labelKey: 'DEVICES.ACTIVE' },
    { value: 'inactive', labelKey: 'DEVICES.INACTIVE' }
  ];

  filteredDevices = computed(() => {
    const option = this.filter();

    return this.store.devices().filter((device) =>
      option === 'all' || device.type === option || device.status === option
    );
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredDevices().length / this.pageSize))
  );

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index + 1)
  );

  paginatedDevices = computed(() => {
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * this.pageSize;

    return this.filteredDevices().slice(start, start + this.pageSize);
  });

  selectedFilterLabel = computed(() => {
    const selected = this.filterOptions.find((item) => item.value === this.filter());

    return selected?.labelKey || 'DEVICES.FILTER_ALL';
  });

  changeFilter(value: DeviceFilter): void {
    this.filter.set(value);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;

    this.currentPage.set(page);
  }

  exportData(): void {
    const rows = this.filteredDevices().map((device) => [
      device.name,
      device.code,
      device.type,
      device.zone,
      this.translate.instant(this.statusLabel(device.status)),
      `${device.battery}%`,
      device.lastSeen,
      device.description
    ]);

    const csv = [
      ['Name', 'Code', 'Type', 'Zone', 'Status', 'Battery', 'Last seen', 'Description'],
      ...rows
    ].map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);
    link.download = 'safehome-devices.csv';
    link.click();
    URL.revokeObjectURL(link.href);

    this.toast.set(this.translate.instant('MESSAGES.EXPORTED'));
    setTimeout(() => this.toast.set(''), 2000);
  }

  icon(type: string): string {
    return type === 'camera'
      ? 'photo_camera'
      : type === 'lock'
        ? 'lock'
        : type === 'smoke'
          ? 'local_fire_department'
          : type === 'window'
            ? 'sensor_window'
            : type === 'gas'
              ? 'gas_meter'
              : type === 'water'
                ? 'water_drop'
                : 'sensors';
  }

  statusClass(status: string): string {
    return status === 'warning'
      ? 'warning'
      : status === 'offline'
        ? 'danger'
        : status === 'inactive'
          ? 'info'
          : 'success';
  }

  statusLabel(status: string): string {
    return `STATUS_LABELS.${status.toUpperCase()}`;
  }
}
