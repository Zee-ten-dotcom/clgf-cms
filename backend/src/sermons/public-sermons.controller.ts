import {
  Controller,
  Get,
} from '@nestjs/common';

import { SermonsService } from './sermons.service';

@Controller('public-sermons')
export class PublicSermonsController {
  constructor(
    private readonly sermonsService: SermonsService,
  ) {}

  @Get()
  findPublished() {
    return this.sermonsService.findPublished();
  }
}
