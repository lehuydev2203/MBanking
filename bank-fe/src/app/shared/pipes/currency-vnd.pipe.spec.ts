import { CurrencyVndPipe } from './currency-vnd.pipe';

describe('CurrencyVndPipe', () => {
  let pipe: CurrencyVndPipe;

  beforeEach(() => {
    pipe = new CurrencyVndPipe();
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format positive numbers correctly', () => {
    expect(pipe.transform(1000000)).toBe('1.000.000,00 ₫');
    expect(pipe.transform(50000)).toBe('50.000,00 ₫');
    expect(pipe.transform(1000)).toBe('1.000,00 ₫');
  });

  it('should format negative numbers correctly', () => {
    expect(pipe.transform(-1000000)).toBe('-1.000.000,00 ₫');
    expect(pipe.transform(-50000)).toBe('-50.000,00 ₫');
  });

  it('should handle zero', () => {
    expect(pipe.transform(0)).toBe('0,00 ₫');
  });

  it('should handle null and undefined', () => {
    expect(pipe.transform(null)).toBe('0 ₫');
    expect(pipe.transform(undefined)).toBe('0 ₫');
  });

  it('should handle empty string', () => {
    expect(pipe.transform('')).toBe('0 ₫');
  });

  it('should handle string numbers', () => {
    expect(pipe.transform('1000000')).toBe('1.000.000,00 ₫');
    expect(pipe.transform('50000.50')).toBe('50.000,50 ₫');
  });

  it('should handle invalid strings', () => {
    expect(pipe.transform('invalid')).toBe('0 ₫');
    expect(pipe.transform('abc123')).toBe('0 ₫');
  });

  it('should handle decimal numbers', () => {
    expect(pipe.transform(1000000.5)).toBe('1.000.000,50 ₫');
    expect(pipe.transform(50000.99)).toBe('50.000,99 ₫');
  });
});
