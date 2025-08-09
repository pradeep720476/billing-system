import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { Public } from './shared/decorators/public.decorator';
import { Roles } from './shared/decorators/role.decorators';
import { RoleType } from './shared/enums/role-type.enum';
import { ApiOperation } from '@nestjs/swagger';

@Controller('/')
export class AppController {
  constructor() {}

  @Public()
  @ApiOperation({ summary: 'App health check', security: [] })
  @Get('health')
  @HttpCode(HttpStatus.OK)
  health() {}

  @Roles(RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get application environment (super admin only)' })
  @Get('/env')
  env() {
    return process.env;
  }
}
