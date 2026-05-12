import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SafeHomeStore } from './shared/application/safehome.store';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',})
export class AppComponent {
  private translate = inject(TranslateService);
  private store = inject(SafeHomeStore);

  constructor() {
    const storedLanguage = localStorage.getItem('safehome-language') || this.store.settings().language || 'en';
    this.translate.addLangs(['en', 'es']);
    this.translate.setFallbackLang('en');
    this.translate.use(storedLanguage);
    document.documentElement.lang = storedLanguage;
    document.body.classList.toggle('dark-mode', this.store.settings().darkMode);
  }
}
