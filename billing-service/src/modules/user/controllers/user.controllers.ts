import { Controller, Get, Post, Body, Request, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { AssignRoleDto } from './dto/assign-role.dto';
import { UserService } from '../services/user.service';
import { AuthenticatedRequest } from 'src/modules/subscription/controllers/dto/user.dto';
import { RoleType } from 'src/shared/enums/role-type.enum';
import { Roles } from 'src/shared/decorators/role.decorators';
import { UserResponseDto } from './dto/user-response';
import { UserMapper } from './mapper/user.mapper';
import { ApiOperation } from '@nestjs/swagger';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current authenticated user' })
  async getMe(@Request() req: AuthenticatedRequest): Promise<UserResponseDto> {
    const user = await this.userService.me(req.user?.id);
    return UserMapper.toResponseDto(user);
  }

  @ApiOperation({ summary: 'List all users (admin only)' })
  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Get()
  async getAllUsers() {
    const users = await this.userService.listUsers();
    return users.map(UserMapper.toResponseDto);
  }

  @ApiOperation({ summary: 'Assign a role to a user (super admin only)' })
  @Roles(RoleType.SUPER_ADMIN)
  @Patch('assign-role')
  @HttpCode(HttpStatus.OK)
  async assignRole(@Body() dto: AssignRoleDto) {
    return this.userService.assignRole(dto);
  }
}
