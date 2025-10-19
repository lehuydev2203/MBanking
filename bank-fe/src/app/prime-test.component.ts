import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-prime-test',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    PasswordModule,
  ],
  template: `
    <div style="padding: 20px; text-align: center;">
      <h1>PrimeNG Test Component</h1>
      <p>Kiểm tra PrimeNG components có hoạt động không</p>

      <div style="max-width: 400px; margin: 20px auto;">
        <p-card>
          <ng-template pTemplate="header">
            <div style="padding: 20px; text-align: center;">
              <h2>Test PrimeNG</h2>
            </div>
          </ng-template>

          <div style="display: flex; flex-direction: column; gap: 15px;">
            <input pInputText placeholder="Test Input Text" />
            <p-password placeholder="Test Password" [feedback]="false" />
            <p-button label="Test Button" icon="pi pi-check"></p-button>
          </div>
        </p-card>
      </div>
    </div>
  `,
})
export class PrimeTestComponent {}
