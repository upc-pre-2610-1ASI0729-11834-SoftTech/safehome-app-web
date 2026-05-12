import { Component, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SafeHomeStore } from '../../application/safehome.store';


@Component({
  selector: 'app-language-switcher',
  standalone: true,
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.css'})
export class LanguageSwitcherComponent {
  private translate = inject(TranslateService);
  private store = inject(SafeHomeStore);
  language = signal(localStorage.getItem('safehome-language') || this.store.settings().language || 'en');

  
  changeLanguage(language: 'en' | 'es'): void {
    this.language.set(language);
    localStorage.setItem('safehome-language', language);
    this.translate.use(language);
    document.documentElement.lang = language;
    this.store.updateSettings({ ...this.store.settings(), language });
  }
}
