import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { APIKeyAuthGuard } from './shared/guards/apikey-auth.guard';
import { Public } from './shared/decorators/public.decorator';

@UseGuards(APIKeyAuthGuard)
@Controller()
export class AppController {
  constructor() {}

  @Get('health')
  @HttpCode(HttpStatus.OK)
  @Public()
  health() {}

  @Get('/env')
  env() {
    return process.env;
  }
}
