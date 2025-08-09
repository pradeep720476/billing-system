import { Module } from '@nestjs/common';
import { RoleRepositoryImpl } from './repositories/role-impl.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from 'src/modules/role/repositories/entities/role.entity';
import { RoleRepository } from './repositories/role.repository';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity])],
  providers: [{ provide: RoleRepository, useClass: RoleRepositoryImpl }],
  exports: [RoleRepository],
})
export class RoleModule {}
