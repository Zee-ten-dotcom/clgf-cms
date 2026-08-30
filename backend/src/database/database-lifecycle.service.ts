import {
  Injectable,
  OnApplicationShutdown,
} from '@nestjs/common';

import {
  closeDatabasePool,
} from './database-pool';

@Injectable()
export class DatabaseLifecycleService
  implements OnApplicationShutdown
{
  async onApplicationShutdown(): Promise<void> {
    await closeDatabasePool();
  }
}
