import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/shared/domain/user.domain';

export class RegisteredUserResponse {
  @ApiProperty()
  id: string;
  @ApiProperty()
  username: string;

  static fromDomain(domain: User): RegisteredUserResponse {
    const dto = new RegisteredUserResponse();
    dto.id = domain.id;
    dto.username = domain.name;
    return dto;
  }
}
