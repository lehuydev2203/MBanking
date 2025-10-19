import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 2rem; text-align: center;">
      <h1 style="color: #333;">🎉 Test Component</h1>
      <p style="font-size: 1.2rem; color: #666;">
        Nếu bạn thấy text này, Angular đang hoạt động!
      </p>
      <div
        style="background: #f0f0f0; padding: 1rem; border-radius: 8px; margin: 1rem 0;"
      >
        <p>✅ Angular Router hoạt động</p>
        <p>✅ Component loading thành công</p>
      </div>
      <button
        style="background: #007bff; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer;"
        (click)="showAlert()"
      >
        Click để test
      </button>
    </div>
  `,
})
export class TestComponent {
  showAlert() {
    alert('Angular hoạt động tốt! 🚀');
  }
}
