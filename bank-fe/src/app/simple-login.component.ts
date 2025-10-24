import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-simple-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div
      style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0f172a; padding: 2rem;"
    >
      <div style="width: 100%; max-width: 400px;">
        <div
          style="background: #1f2937; border: 1px solid #374151; border-radius: 12px; padding: 2rem;"
        >
          <div style="text-align: center; margin-bottom: 2rem;">
            <h1
              style="color: #f9fafb; font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem;"
            >
              Đăng nhập
            </h1>
            <p style="color: #6b7280;">Chào mừng bạn quay trở lại</p>
          </div>

          <form
            [formGroup]="loginForm"
            (ngSubmit)="onSubmit()"
            style="display: flex; flex-direction: column; gap: 1rem;"
          >
            <div>
              <label
                for="email"
                style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #f9fafb;"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="Nhập email của bạn"
                style="width: 100%; padding: 0.75rem; border: 1px solid #374151; border-radius: 8px; background: #1f2937; color: #f9fafb;"
                [class.ng-invalid]="
                  loginForm.get('email')?.invalid &&
                  loginForm.get('email')?.touched
                "
              />
              @if (
                loginForm.get('email')?.invalid &&
                loginForm.get('email')?.touched
              ) {
                <small style="color: #ef4444;">
                  Vui lòng nhập email hợp lệ
                </small>
              }
            </div>

            <div>
              <label
                for="password"
                style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #f9fafb;"
              >
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                formControlName="password"
                placeholder="Nhập mật khẩu"
                style="width: 100%; padding: 0.75rem; border: 1px solid #374151; border-radius: 8px; background: #1f2937; color: #f9fafb;"
                [class.ng-invalid]="
                  loginForm.get('password')?.invalid &&
                  loginForm.get('password')?.touched
                "
              />
              @if (
                loginForm.get('password')?.invalid &&
                loginForm.get('password')?.touched
              ) {
                <small style="color: #ef4444;"> Vui lòng nhập mật khẩu </small>
              }
            </div>

            <button
              type="submit"
              style="width: 100%; padding: 0.75rem; background: #7c8cf9; color: white; border: none; border-radius: 8px; font-weight: 500; cursor: pointer;"
              [disabled]="loginForm.invalid || isLoading"
            >
              {{ isLoading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
            </button>
          </form>

          <div style="text-align: center; margin-top: 1rem;">
            <p style="font-size: 0.875rem; color: #6b7280;">
              Chưa có tài khoản?
              <a
                routerLink="/register"
                style="color: #3b82f6; text-decoration: underline;"
              >
                Đăng ký ngay
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SimpleLoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;

      // Simulate login process
      setTimeout(() => {
        this.isLoading = false;
        this.router.navigate(['/app/dashboard']);
      }, 2000);
    }
  }
}
