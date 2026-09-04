import {
  Controller,
  Get,
} from '@nestjs/common';

import { WeeklyServicesService } from './weekly-services.service';

@Controller('public-weekly-services')
export class PublicWeeklyServicesController {
  constructor(
    private readonly weeklyServicesService: WeeklyServicesService,
  ) {}

  @Get()
  findPublic() {
    return this.weeklyServicesService.findPublic();
  }
}
