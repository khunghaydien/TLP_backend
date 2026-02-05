import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersModule as UsersLibModule } from 'defaultLibraryPrefix/users';

@Module({
  imports: [UsersLibModule],
  controllers: [UsersController],
})
export class UsersModule {}
