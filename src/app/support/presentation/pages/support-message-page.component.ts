import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SafeHomeStore } from '../../../shared/application/safehome.store';


@Component({
  selector: 'app-support-message-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './support-message-page.component.html',
  styleUrl: './support-message-page.component.css'})
export class SupportMessagePageComponent {
  private store = inject(SafeHomeStore);
  private router = inject(Router);
  private translate = inject(TranslateService);
  ticket = { name: '', email: '', category: 'Devices', subject: '', message: '' };
  evidenceName = '';
  message = '';

  
  selectEvidence(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.evidenceName = input.files?.[0]?.name || '';
  }

  
  send(): void {
    if (!this.ticket.name.trim() || !this.ticket.email.trim() || !this.ticket.subject.trim() || !this.ticket.message.trim()) {
      this.message = this.translate.instant('MESSAGES.REQUIRED_FIELDS');
      setTimeout(() => this.message = '', 2200);
      return;
    }

    this.store.addTicket({ ...this.ticket, subject: this.evidenceName ? `${this.ticket.subject} (${this.evidenceName})` : this.ticket.subject });
    this.message = this.translate.instant('MESSAGES.SUPPORT_SENT');
    setTimeout(() => this.router.navigateByUrl('/support'), 1000);
  }
}
