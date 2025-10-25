import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { DefaultRouteGuard } from './core/guards/default-route.guard';

export const routes: Routes = [
  // Public routes
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./features/auth/verify-email/verify-email.component').then(
        (m) => m.VerifyEmailComponent,
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: '403',
    loadComponent: () =>
      import('./shared/components/forbidden/forbidden.component').then(
        (m) => m.ForbiddenComponent,
      ),
  },

  // Protected routes - User routes
  {
    path: 'app',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/user/user-layout/user-layout.component').then(
        (m) => m.UserLayoutComponent,
      ),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'deposit',
        loadComponent: () =>
          import('./features/wallet/deposit/deposit.component').then(
            (m) => m.DepositComponent,
          ),
      },
      {
        path: 'withdraw',
        loadComponent: () =>
          import('./features/wallet/withdraw/withdraw.component').then(
            (m) => m.WithdrawComponent,
          ),
      },
      {
        path: 'transfer',
        loadComponent: () =>
          import('./features/wallet/transfer/transfer.component').then(
            (m) => m.TransferComponent,
          ),
      },
      {
        path: 'transfer/confirm',
        loadComponent: () =>
          import(
            './features/wallet/transfer-confirm/transfer-confirm.component'
          ).then((m) => m.TransferConfirmComponent),
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./features/transactions/transactions.component').then(
            (m) => m.TransactionsComponent,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then(
            (m) => m.ProfileComponent,
          ),
      },
    ],
  },

  // Protected routes - Admin routes
  {
    path: 'app/admin',
    canActivate: [AuthGuard, RoleGuard],
    loadComponent: () =>
      import('./features/admin/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent,
      ),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import(
            './features/admin/admin-dashboard/general/general.component'
          ).then((m) => m.GeneralComponent),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/users/users.component').then(
            (m) => m.UsersComponent,
          ),
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import(
            './features/admin/admin-transactions/admin-transactions.component'
          ).then((m) => m.AdminTransactionsComponent),
      },
    ],
  },

  // Default redirects
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
