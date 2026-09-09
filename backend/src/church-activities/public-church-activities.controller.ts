import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';

import {
  ChurchActivitiesService,
} from './church-activities.service';

@Controller('public/church-activities')
export class PublicChurchActivitiesController {
  constructor(
    private readonly churchActivitiesService:
      ChurchActivitiesService,
  ) {}

  @Get()
  findPublished() {
    return this.churchActivitiesService.findPublished();
  }

  @Get(':id')
  findPublishedOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.churchActivitiesService.findPublishedOne(id);
  }
}
