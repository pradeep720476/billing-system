import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginUserRequestDto } from '../dto/login-user-request.dto';
import { RegisterUserRequestDto } from '../dto/register-user-request.dto';
import { Public } from 'src/shared/decorators/public.decorator';
import { ApiOperation } from '@nestjs/swagger';
import { RegisteredUserResponse } from '../dto/registered-user.response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOperation({ summary: 'Get token with login', security: [] })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginUserRequestDto) {
    return await this.authService.login(dto);
  }

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register user', security: [] })
  @Post('register')
  async register(@Body() dto: RegisterUserRequestDto) {
    const registerdUser = await this.authService.register(dto);
    return RegisteredUserResponse.fromDomain(registerdUser);
  }
}
