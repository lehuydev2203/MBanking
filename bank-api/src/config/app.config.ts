import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.APP_PORT || '1403', 10),
  baseUrl: process.env.APP_BASE_URL || 'http://localhost:2203',
  nodeEnv: process.env.NODE_ENV || 'development',
  timezone: process.env.TZ || 'Asia/Ho_Chi_Minh',
}));
