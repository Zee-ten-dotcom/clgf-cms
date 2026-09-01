import { Controller, Get } from '@nestjs/common';

import { EventsService } from './events.service';

@Controller('public-events')
export class PublicEventsController {
  constructor(
    private readonly eventsService: EventsService,
  ) {}

  @Get('upcoming')
  findUpcoming() {
    return this.eventsService.findPublicUpcoming();
  }
}
