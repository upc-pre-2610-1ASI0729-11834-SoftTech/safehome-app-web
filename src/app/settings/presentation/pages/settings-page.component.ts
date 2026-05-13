import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SafeHomeStore } from '../../../shared/application/safehome.store';
import { HomeZoneEntity, SafeSettingsEntity } from '../../../shared/domain/model/safehome-state.entity';
import { LanguageSwitcherComponent } from '../../../shared/presentation/components/language-switcher.component';


@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, LanguageSwitcherComponent],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.css'})
export class SettingsPageComponent {
  store = inject(SafeHomeStore);
  private translate = inject(TranslateService);
  draft: SafeSettingsEntity = { ...this.store.settings() };
  message = '';

  
  saveAll(): void { this.store.updateSettings({ ...this.draft }); }

  
  saveAndNotify(): void { this.saveAll(); this.showMessage('MESSAGES.SAVED'); }

  
  addZone(): void { this.store.addZone(); this.showMessage('MESSAGES.SAVED'); }

  
  updateZone(zone: HomeZoneEntity, status: HomeZoneEntity['status']): void { this.store.updateZone({ ...zone, status }); this.showMessage('MESSAGES.SAVED'); }

  
  restoreDefaultConfig(): void {
    const currentLanguage = this.store.settings().language;
    this.store.restoreDefaultConfig();
    this.draft = { ...this.store.settings(), language: currentLanguage };
    this.store.updateSettings({ ...this.draft });
    this.showMessage('MESSAGES.RESET');
  }

  
  showMessage(key: string): void { this.message = this.translate.instant(key); setTimeout(() => this.message = '', 2000); }
}
