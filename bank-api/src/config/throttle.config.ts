import { registerAs } from '@nestjs/config';

export default registerAs('throttle', () => ({
  ttl: parseInt(process.env.THROTTLE_TTL || '600000', 10), // 10 minutes
  limit: parseInt(process.env.THROTTLE_LIMIT || '5', 10),
}));
