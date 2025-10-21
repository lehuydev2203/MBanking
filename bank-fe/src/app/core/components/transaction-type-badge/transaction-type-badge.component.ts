import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeModule } from 'primeng/badge';
import {
  TransactionType,
  getTransactionTypeLabel,
  getTransactionTypeIcon,
  getTransactionTypeColor,
  getTransactionTypeSeverity,
} from '../../types/transaction.types';

@Component({
  selector: 'app-transaction-type-badge',
  standalone: true,
  imports: [CommonModule, BadgeModule],
  template: `
    <div class="transaction-badge">
      <i [class]="typeIcon" [class]="typeColor"></i>
      <p-badge
        [value]="typeLabel"
        [severity]="typeSeverity"
        [style]="{ 'font-size': '0.75rem', 'margin-left': '0.25rem' }"
      >
      </p-badge>
    </div>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }

      .transaction-badge {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }
    `,
  ],
})
export class TransactionTypeBadgeComponent {
  @Input() transType!: number;

  get typeLabel(): string {
    return getTransactionTypeLabel(this.transType);
  }

  get typeIcon(): string {
    return getTransactionTypeIcon(this.transType);
  }

  get typeColor(): string {
    return getTransactionTypeColor(this.transType);
  }

  get typeSeverity(): 'success' | 'danger' | 'info' | 'warn' {
    return getTransactionTypeSeverity(this.transType);
  }
}
