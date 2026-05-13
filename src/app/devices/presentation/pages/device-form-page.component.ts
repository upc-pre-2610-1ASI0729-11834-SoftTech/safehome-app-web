import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SafeHomeStore } from '../../../shared/application/safehome.store';
import { DeviceEntity } from '../../domain/model/device.entity';


@Component({
  selector: 'app-device-form-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './device-form-page.component.html',
  styleUrl: './device-form-page.component.css'})
export class DeviceFormPageComponent {
  private router = inject(Router);
  private store = inject(SafeHomeStore);
  private translate = inject(TranslateService);
  step = signal(1);
  message = signal('');
  draft: Omit<DeviceEntity, 'id'> = {
    name: '',
    code: this.store.nextDeviceCode('motion'),
    type: 'motion',
    zone: '',
    status: 'active',
    battery: 100,
    lastSeen: 'Just now',
    description: ''
  };

  types: { value: DeviceEntity['type']; icon: string; labelKey: string; textKey: string }[] = [
    { value: 'motion', icon: 'sensors', labelKey: 'DEVICES.TYPE_MOTION', textKey: 'DEVICES.TYPE_MOTION_TEXT' },
    { value: 'camera', icon: 'photo_camera', labelKey: 'DEVICES.TYPE_CAMERA', textKey: 'DEVICES.TYPE_CAMERA_TEXT' },
    { value: 'lock', icon: 'lock', labelKey: 'DEVICES.TYPE_LOCK', textKey: 'DEVICES.TYPE_LOCK_TEXT' },
    { value: 'smoke', icon: 'local_fire_department', labelKey: 'DEVICES.TYPE_SMOKE', textKey: 'DEVICES.TYPE_SMOKE_TEXT' },
    { value: 'gas', icon: 'gas_meter', labelKey: 'DEVICES.TYPE_GAS', textKey: 'DEVICES.TYPE_GAS_TEXT' },
    { value: 'water', icon: 'water_drop', labelKey: 'DEVICES.TYPE_WATER', textKey: 'DEVICES.TYPE_WATER_TEXT' }
  ];

  
  selectType(type: DeviceEntity['type']): void { this.draft = { ...this.draft, type, code: this.store.nextDeviceCode(type) }; }

  
  selectedIcon(): string { return this.types.find((item) => item.value === this.draft.type)?.icon || 'sensors'; }

  
  typeLabel(): string { return this.types.find((item) => item.value === this.draft.type)?.value || this.draft.type; }

  
  nextStep(): void {
    if (this.step() === 2 && (!this.draft.name.trim() || !this.draft.zone.trim())) {
      this.showMessage('MESSAGES.REQUIRED_FIELDS');
      return;
    }
    this.step.set(Math.min(3, this.step() + 1));
  }

  
  previousStep(): void { this.step.set(Math.max(1, this.step() - 1)); }

  
  saveDevice(): void {
    if (!this.draft.name.trim() || !this.draft.zone.trim()) {
      this.showMessage('MESSAGES.REQUIRED_FIELDS');
      return;
    }

    this.store.addDevice({
      ...this.draft,
      name: this.draft.name.trim(),
      zone: this.draft.zone.trim(),
      description: this.draft.description.trim()
    }).subscribe({
      next: device => this.router.navigate(['/devices', device.id]),
      error: () => this.showMessage('Information could not be saved.')
    });
  }

  
  showMessage(key: string): void {
    this.message.set(this.translate.instant(key));
    setTimeout(() => this.message.set(''), 2200);
  }
}
