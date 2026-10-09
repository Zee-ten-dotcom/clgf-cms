import {
  Controller,
  ForbiddenException,
  Headers,
  Post,
} from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import { AnnouncementSchedulerService } from './announcement-scheduler.service';

@Controller('internal/announcement-scheduler')
export class AnnouncementSchedulerController {
  constructor(
    private readonly scheduler: AnnouncementSchedulerService,
  ) {}

  @Post('run')
  async run(@Headers('x-scheduler-secret') supplied?: string) {
    const expected = process.env.SCHEDULER_SECRET;

    if (!expected || !supplied) {
      throw new ForbiddenException('Access denied');
    }

    const a = Buffer.from(expected);
    const b = Buffer.from(supplied);

    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new ForbiddenException('Access denied');
    }

    await this.scheduler.checkDueAnnouncements();

    return { success: true };
  }
}
