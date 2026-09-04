import {
  Controller,
  Get,
} from '@nestjs/common';

import { AnnouncementsService } from './announcements.service';

@Controller('public-announcements')
export class PublicAnnouncementsController {
  constructor(
    private readonly announcementsService: AnnouncementsService,
  ) {}

  @Get()
  findPublic() {
    return this.announcementsService.findPublic();
  }
}
