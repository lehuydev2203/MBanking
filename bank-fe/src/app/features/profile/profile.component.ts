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
  nicknameForm: FormGroup;
  currentProfile: UserProfile | null = null;
  isLoadingProfile = false;
  isUpdatingProfile = false;
  isEditing = false;
  isSettingNickname = false;

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
      newPassword: ['', [Validators.minLength(6)]],
    });

    this.nicknameForm = this.fb.group({
      nickname: [
        '',
        [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]{3,20}$/)],
      ],
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

  setNickname(): void {
    if (this.nicknameForm.valid) {
      this.isSettingNickname = true;
      const nickname = this.nicknameForm.value.nickname;

      this.accountsService
        .setNickname(nickname)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.isSettingNickname = false;
            this.nicknameForm.reset();
            this.loadProfile(); // Reload profile to get updated nickname
            this.messageService.add({
              severity: 'success',
              summary: 'Tạo nickname thành công',
              detail: `Nickname @${nickname} đã được tạo thành công. Bạn sẽ nhận được email xác nhận.`,
              life: 5000,
            });
          },
          error: (error) => {
            this.isSettingNickname = false;
            let errorMessage = 'Không thể tạo nickname';

            if (error.error?.code === 'NICKNAME_ALREADY_SET') {
              errorMessage =
                'Nickname chỉ có thể tạo 1 lần duy nhất và không thể thay đổi';
            } else if (error.error?.code === 'NICKNAME_TAKEN') {
              errorMessage = 'Nickname này đã được sử dụng bởi tài khoản khác';
            } else if (error.error?.code === 'INVALID_NICKNAME_FORMAT') {
              errorMessage =
                'Nickname phải có 3-20 ký tự và chỉ chứa chữ cái, số và dấu gạch dưới';
            }

            this.messageService.add({
              severity: 'error',
              summary: 'Lỗi tạo nickname',
              detail: errorMessage,
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
