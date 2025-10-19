import { startOfDay, endOfDay } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

export class TimezoneUtil {
  static readonly TIMEZONE = 'Asia/Ho_Chi_Minh';

  static getStartOfDay(date: Date = new Date()): Date {
    const zonedDate = utcToZonedTime(date, this.TIMEZONE);
    const startOfDayZoned = startOfDay(zonedDate);
    return zonedTimeToUtc(startOfDayZoned, this.TIMEZONE);
  }

  static getEndOfDay(date: Date = new Date()): Date {
    const zonedDate = utcToZonedTime(date, this.TIMEZONE);
    const endOfDayZoned = endOfDay(zonedDate);
    return zonedTimeToUtc(endOfDayZoned, this.TIMEZONE);
  }

  static getCurrentDateInTimezone(): Date {
    return utcToZonedTime(new Date(), this.TIMEZONE);
  }

  static convertToTimezone(date: Date): Date {
    return utcToZonedTime(date, this.TIMEZONE);
  }

  static convertToUTC(date: Date): Date {
    return zonedTimeToUtc(date, this.TIMEZONE);
  }
}
