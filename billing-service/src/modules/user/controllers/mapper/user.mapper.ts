import { User } from 'src/shared/domain/user.domain';
import { UserResponseDto } from '../dto/user-response';

export class UserMapper {
  static toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      verified: user.verified,
    } as UserResponseDto;
  }
}
