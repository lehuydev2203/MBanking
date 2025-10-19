import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  host: process.env.EMAIL_HOST || 'localhost',
  port: parseInt(process.env.EMAIL_PORT || '1025', 10),
  user: process.env.EMAIL_USER || '',
  pass: process.env.EMAIL_PASS || '',
  from: process.env.EMAIL_FROM || 'noreply@banking.local',
}));
