import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface SupportCategory {
  titleKey: string;
  icon: string;
  textKey: string;
  articleKeys: string[];
}


@Component({
  selector: 'app-support-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './support-page.component.html',
  styleUrl: './support-page.component.css'})
export class SupportPageComponent {
  private translate = inject(TranslateService);
  query = '';
  selected = signal<SupportCategory | null>(null);
  openArticle = signal('');
  openQuestion = signal('');

  categories: SupportCategory[] = [
    { titleKey: 'SUPPORT.CAT_START', icon: 'attach_money', textKey: 'SUPPORT.CAT_START_TEXT', articleKeys: ['START_1', 'START_2', 'START_3'] },
    { titleKey: 'SUPPORT.CAT_DEVICES', icon: 'devices', textKey: 'SUPPORT.CAT_DEVICES_TEXT', articleKeys: ['DEVICES_1', 'DEVICES_2', 'DEVICES_3'] },
    { titleKey: 'SUPPORT.CAT_ALERTS', icon: 'notifications', textKey: 'SUPPORT.CAT_ALERTS_TEXT', articleKeys: ['ALERTS_1', 'ALERTS_2', 'ALERTS_3'] },
    { titleKey: 'SUPPORT.CAT_PRIVACY', icon: 'lock', textKey: 'SUPPORT.CAT_PRIVACY_TEXT', articleKeys: ['PRIVACY_1', 'PRIVACY_2', 'PRIVACY_3'] },
    { titleKey: 'SUPPORT.CAT_ACCOUNT', icon: 'person', textKey: 'SUPPORT.CAT_ACCOUNT_TEXT', articleKeys: ['ACCOUNT_1', 'ACCOUNT_2', 'ACCOUNT_3'] },
    { titleKey: 'SUPPORT.CAT_FAQ', icon: 'help', textKey: 'SUPPORT.CAT_FAQ_TEXT', articleKeys: ['FAQ_1', 'FAQ_2', 'FAQ_3'] }
  ];

  questions = ['SUPPORT.Q1', 'SUPPORT.Q2', 'SUPPORT.Q3'];

  
  filteredCategories(): SupportCategory[] {
    const text = this.query.trim().toLowerCase();
    if (!text) return this.categories;
    return this.categories.filter((category) => `${this.translate.instant(category.titleKey)} ${this.translate.instant(category.textKey)}`.toLowerCase().includes(text));
  }

  
  filteredQuestions(): string[] {
    const text = this.query.trim().toLowerCase();
    if (!text) return this.questions;
    return this.questions.filter((question) => this.translate.instant(question).toLowerCase().includes(text));
  }

  
  openArticles(category: SupportCategory): void { this.selected.set(category); this.openArticle.set(category.articleKeys[0]); }

  
  closeArticles(): void { this.selected.set(null); this.openArticle.set(''); }

  
  toggleArticle(articleKey: string): void { this.openArticle.set(this.openArticle() === articleKey ? '' : articleKey); }

  
  answerForQuestion(question: string): string { return question.replace('Q', 'A'); }
}
