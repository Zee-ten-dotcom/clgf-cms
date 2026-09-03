import { Controller, Get } from '@nestjs/common';
import { HomeCellsService } from './home-cells.service';

@Controller('public-home-cells')
export class PublicHomeCellsController {
  constructor(
    private readonly homeCellsService: HomeCellsService,
  ) {}

  @Get()
  findPublic() {
    return this.homeCellsService.findPublic();
  }
}
