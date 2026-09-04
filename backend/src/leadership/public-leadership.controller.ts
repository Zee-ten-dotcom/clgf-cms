import { Controller, Get } from '@nestjs/common';

import { LeadershipService } from './leadership.service';

@Controller('public-leadership')
export class PublicLeadershipController {
  constructor(
    private readonly leadershipService: LeadershipService,
  ) {}

  @Get()
  findAll() {
    return this.leadershipService.findPublic();
  }
}
