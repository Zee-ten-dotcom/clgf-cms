import { Controller, Get } from '@nestjs/common';
import { MinistriesService } from './ministries.service';

@Controller('public-ministries')
export class PublicMinistriesController {
  constructor(
    private readonly ministriesService: MinistriesService,
  ) {}

  @Get()
  findAll() {
    return this.ministriesService.findPublic();
  }
}
