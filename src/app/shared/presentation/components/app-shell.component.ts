import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SafeHomeStore } from '../../application/safehome.store';
import { LanguageSwitcherComponent } from './language-switcher.component';


@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TranslateModule, LanguageSwitcherComponent],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.css'})
export class AppShellComponent {
  store = inject(SafeHomeStore);
  private router = inject(Router);

  
  shortName(): string {
    const names = this.store.user().name.split(' ').filter(Boolean);
    const first = names[0] || 'User';
    const second = names[1]?.[0] || '';
    return second ? `${first} ${second}.` : first;
  }

  
  logout(): void {
    this.router.navigateByUrl('/login');
  }
}
