import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import * as fs from 'fs';

import {
  JwtAuthGuard,
} from '../auth/jwt-auth.guard';
import {
  RolesGuard,
} from '../auth/roles.guard';
import {
  Roles,
} from '../auth/roles.decorator';
import {
  BackupsService,
} from './backups.service';

@Roles('ADMIN')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Controller('backups')
export class BackupsController {
  constructor(
    private readonly backupsService:
      BackupsService,
  ) {}

  @Get()
  list() {
    return {
      backups: this.backupsService.list(),
      status: this.backupsService.status(),
    };
  }

  @Post()
  create() {
    return this.backupsService.create();
  }

  @Get(':name/download')
  download(
    @Param('name') name: string,
    @Res() response: Response,
  ) {
    const file =
      this.backupsService.getDownloadPath(name);

    response.setHeader(
      'Content-Type',
      'application/octet-stream',
    );
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${name}"`,
    );

    fs.createReadStream(file).pipe(response);
  }
}
