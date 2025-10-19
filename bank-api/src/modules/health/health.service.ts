import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class HealthService {
  constructor(@InjectConnection() private connection: Connection) {}

  async getHealthStatus() {
    let dbStatus = 'down';
    try {
      // Test database connection
      await this.connection.db?.admin().ping();
      dbStatus = 'ok';
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    let appVersion = 'unknown';
    try {
      const packageJson = JSON.parse(
        readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
      );
      appVersion = packageJson.version || 'unknown';
    } catch (error) {
      console.error('Failed to read package.json:', error);
    }

    return {
      status: 'up',
      db: dbStatus,
      appVersion,
      time: new Date().toISOString(),
    };
  }
}
