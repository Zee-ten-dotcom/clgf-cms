import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PushNotificationsService } from './push-notifications.service';

@Controller('push-notifications')
export class PushNotificationsController {
  constructor(
    private readonly pushNotificationsService:
      PushNotificationsService,
  ) {}

  @Get('public-key')
  getPublicKey() {
    return this.pushNotificationsService.getPublicKey();
  }

  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  subscribe(
    @Req() request: any,
    @Body()
    body: {
      endpoint: string;
      keys: {
        p256dh: string;
        auth: string;
      };
    },
  ) {
    return this.pushNotificationsService.subscribe(
      request.user.sub,
      body,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('unsubscribe')
  unsubscribe(
    @Req() request: any,
    @Body() body: { endpoint: string },
  ) {
    return this.pushNotificationsService.unsubscribe(
      request.user.sub,
      body.endpoint,
    );
  }
}
