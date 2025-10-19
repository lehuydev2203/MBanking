import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';

import {
  AccountsService,
  UserProfile,
  UpdateProfileRequest,
} from '../../core/services/accounts.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
    ProgressSpinnerModule,
  ],
  providers: [MessageService],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;
  currentProfile: UserProfile | null = null;
  isLoadingProfile = false;
  isUpdatingProfile = false;
  isEditing = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private accountsService: AccountsService,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router,
  ) {
    this.profileForm = this.fb.group({
      phone: ['', [Validators.required]],
      nickname: ['', [Validators.pattern(/^[a-zA-Z0-9_]{3,20}$/)]],
      newPassword: ['', [Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProfile(): void {
    this.isLoadingProfile = true;
    this.accountsService
      .getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.currentProfile = profile;
          this.profileForm.patchValue({
            phone: profile.phone,
            nickname: profile.nickname || '',
          });
          this.isLoadingProfile = false;
        },
        error: () => {
          this.isLoadingProfile = false;
        },
      });
  }

  startEditing(): void {
    this.isEditing = true;
    this.profileForm.patchValue({
      phone: this.currentProfile?.phone || '',
      nickname: this.currentProfile?.nickname || '',
      newPassword: '',
    });
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.profileForm.reset();
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.isUpdatingProfile = true;

      // Update profile data
      const updateData: UpdateProfileRequest = {
        name: this.currentProfile?.name || '',
        phone: this.profileForm.value.phone,
        nickname: this.profileForm.value.nickname || undefined,
      };

      this.accountsService
        .updateProfile(updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedProfile) => {
            this.currentProfile = updatedProfile;

            // Update password if provided
            if (this.profileForm.value.newPassword) {
              this.authService
                .changePassword({
                  currentPassword: '', // This might need to be handled differently
                  newPassword: this.profileForm.value.newPassword,
                })
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                  next: () => {
                    this.isUpdatingProfile = false;
                    this.isEditing = false;
                    this.messageService.add({
                      severity: 'success',
                      summary: 'Cập nhật thành công',
                      detail: 'Thông tin cá nhân và mật khẩu đã được cập nhật',
                      life: 5000,
                    });
                  },
                  error: () => {
                    this.isUpdatingProfile = false;
                    this.messageService.add({
                      severity: 'error',
                      summary: 'Lỗi cập nhật mật khẩu',
                      detail:
                        'Thông tin cá nhân đã được cập nhật nhưng mật khẩu không thành công',
                      life: 5000,
                    });
                  },
                });
            } else {
              this.isUpdatingProfile = false;
              this.isEditing = false;
              this.messageService.add({
                severity: 'success',
                summary: 'Cập nhật thành công',
                detail: 'Thông tin cá nhân đã được cập nhật',
                life: 5000,
              });
            }
          },
          error: () => {
            this.isUpdatingProfile = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Lỗi cập nhật',
              detail: 'Không thể cập nhật thông tin cá nhân',
              life: 5000,
            });
          },
        });
    }
  }

  logout(): void {
    this.authService.logout();
    this.messageService.add({
      severity: 'success',
      summary: 'Đăng xuất thành công',
      detail: 'Bạn đã đăng xuất khỏi tài khoản',
      life: 3000,
    });
    this.router.navigate(['/auth/login']);
  }
}
