import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyVnd',
  standalone: true,
})
export class CurrencyVndPipe implements PipeTransform {
  private formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 2,
  });

  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '0 ₫';
    }

    const numericValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numericValue)) {
      return '0 ₫';
    }

    return this.formatter.format(numericValue);
  }
}
