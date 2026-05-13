import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SafeHomeStore } from '../../../shared/application/safehome.store';
import { SafeUserEntity } from '../../../shared/domain/model/safehome-state.entity';


@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'})
export class ProfilePageComponent {
  store = inject(SafeHomeStore);
  private translate = inject(TranslateService);
  editing = false;
  passwordMode = false;
  draft: SafeUserEntity = { ...this.store.user() };
  newPassword = '';
  confirmPassword = '';
  message = '';
  planOpen = false;

  
  toggleEdit(): void { this.editing = !this.editing; this.draft = { ...this.store.user() }; }

  
  togglePassword(): void { this.passwordMode = !this.passwordMode; }

  
  saveProfile(): void { this.store.updateUser({ ...this.draft }); this.editing = false; this.showMessage('MESSAGES.SAVED'); }

  
  updateSecurity(field: 'twoFactor' | 'loginAlerts', value: boolean): void { this.store.updateSettings({ ...this.store.settings(), [field]: value }); this.showMessage('MESSAGES.SAVED'); }

  
  savePassword(): void { this.passwordMode = false; this.newPassword = ''; this.confirmPassword = ''; this.showMessage('MESSAGES.PASSWORD'); }

  
  togglePlan(): void { this.planOpen = !this.planOpen; }

  
  showMessage(key: string): void { this.message = this.translate.instant(key); setTimeout(() => this.message = '', 2200); }
}
