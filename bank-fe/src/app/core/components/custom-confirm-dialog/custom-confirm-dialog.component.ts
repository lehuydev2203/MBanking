import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';

export interface ConfirmDialogData {
  title: string;
  message: string;
  icon?: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  cancelButtonClass?: string;
}

@Component({
  selector: 'app-custom-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="dialog-overlay"
      *ngIf="visible"
      (click)="onOverlayClick($event)"
    >
      <div class="dialog-container" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="dialog-header">
          <h3 class="dialog-title">{{ data.title }}</h3>
          <button
            type="button"
            class="dialog-close-btn"
            (click)="onCancel()"
            aria-label="Đóng dialog"
          >
            <i class="pi pi-times"></i>
          </button>
        </div>

        <!-- Content -->
        <div class="dialog-content">
          <div class="dialog-message">
            <div class="message-icon" *ngIf="data.icon">
              <i [class]="data.icon"></i>
            </div>
            <div class="message-text">
              {{ data.message }}
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="dialog-footer">
          <button
            type="button"
            class="dialog-btn cancel-btn"
            [class]="data.cancelButtonClass || 'cancel-btn'"
            (click)="onCancel()"
          >
            {{ data.cancelText || 'Hủy' }}
          </button>
          <button
            type="button"
            class="dialog-btn confirm-btn"
            [class]="data.confirmButtonClass || 'confirm-btn'"
            (click)="onConfirm()"
          >
            {{ data.confirmText || 'Xác nhận' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./custom-confirm-dialog.component.scss'],
})
export class CustomConfirmDialogComponent implements OnInit, OnDestroy {
  @Input() visible = false;
  @Input() data: ConfirmDialogData = {
    title: 'Xác nhận',
    message: 'Bạn có chắc chắn muốn thực hiện hành động này?',
    icon: 'pi pi-exclamation-triangle',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
  };

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Prevent body scroll when dialog is open
    if (this.visible) {
      document.body.style.overflow = 'hidden';
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
    this.destroy$.next();
    this.destroy$.complete();
  }

  onConfirm(): void {
    this.confirm.emit();
    this.closeDialog();
  }

  onCancel(): void {
    this.cancel.emit();
    this.closeDialog();
  }

  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  private closeDialog(): void {
    this.visible = false;
    document.body.style.overflow = '';
    this.close.emit();
  }
}
