import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SafeHomeStore } from '../../../shared/application/safehome.store';
import { LanguageSwitcherComponent } from '../../../shared/presentation/components/language-switcher.component';


@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule, LanguageSwitcherComponent],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css'})
export class AuthPageComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private store = inject(SafeHomeStore);
  private translate = inject(TranslateService);

  mode = signal<'login' | 'register' | 'forgot' | 'success'>('login');
  notice = signal(false);
  message = signal('');
  email = '';
  password = '';
  confirmPassword = '';
  registerName = '';
  remember = false;
  acceptedTerms = false;

  constructor() {
    this.route.data.subscribe((data) => this.mode.set((data['mode'] || 'login') as 'login' | 'register' | 'forgot' | 'success'));
  }

  
  login(): void {
    const email = this.email.trim().toLowerCase();

    if (this.store.isTeamAccount(email, this.password)) {
      this.store.loadTeamAccount();
      this.router.navigateByUrl('/dashboard');
      return;
    }

    const account = this.store.findRegisteredAccount(email, this.password);
    if (account) {
      this.store.loadRegisteredAccount(account);
      this.router.navigateByUrl('/dashboard');
      return;
    }

    this.showMessage('AUTH.INVALID_CREDENTIALS');
  }

  
  register(): void {
    if (!this.registerName.trim() || !this.email.trim() || !this.password || this.password !== this.confirmPassword || !this.acceptedTerms) {
      this.showMessage('AUTH.REGISTER_ERROR');
      return;
    }

    this.store.createEmptyAccount(this.registerName.trim(), this.email.trim(), this.password);
    this.router.navigateByUrl('/account-created');
  }

  
  openDashboard(): void {
    this.router.navigateByUrl('/dashboard');
  }

  
  showMessage(key: string): void {
    this.message.set(this.translate.instant(key));
    setTimeout(() => this.message.set(''), 2400);
  }

  
  recover(): void {
    this.notice.set(true);
  }


  
  goToAddDevice(): void {
    this.router.navigateByUrl('/devices/new');
  }

  
  heroTitle(): string {
    if (this.mode() === 'register') return 'AUTH.CREATE_HERO_TITLE';
    if (this.mode() === 'forgot') return 'AUTH.FORGOT_HERO_TITLE';
    return 'AUTH.LOGIN_HERO_TITLE';
  }

  
  heroText(): string {
    if (this.mode() === 'register') return 'AUTH.CREATE_HERO_TEXT';
    if (this.mode() === 'forgot') return 'AUTH.FORGOT_HERO_TEXT';
    return 'AUTH.LOGIN_HERO_TEXT';
  }
}
