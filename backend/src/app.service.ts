import { Injectable } from '@nestjs/common';

import { getDatabasePool } from './database/database-pool';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async getHealth() {
    const startedAt = Date.now();

    const result = await getDatabasePool().query(
      'SELECT 1 AS ok',
    );

    return {
      status: 'ok',
      database:
        result.rows[0]?.ok === 1
          ? 'connected'
          : 'unknown',
      uptimeSeconds: Math.floor(
        process.uptime(),
      ),
      responseTimeMs:
        Date.now() - startedAt,
      timestamp:
        new Date().toISOString(),
    };
  }
}
