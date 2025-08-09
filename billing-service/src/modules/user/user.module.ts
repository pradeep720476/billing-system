import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserRepositoryImpl } from './repositories/user-impl.respository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/modules/user/repositories/entities/user.entity';
import { UserRepository } from './repositories/user.respository';
import { RoleModule } from '../role/role.module';
import { UserController } from './controllers/user.controllers';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), RoleModule],
  providers: [UserService, { provide: UserRepository, useClass: UserRepositoryImpl }],
  controllers: [UserController],
  exports: [UserRepository, UserService],
})
export class UserModule {}
