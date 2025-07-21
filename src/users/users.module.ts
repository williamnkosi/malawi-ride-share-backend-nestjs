import { Module } from '@nestjs/common';
import { DriversModule } from './drivers/drivers.module';
import { RidersModule } from './riders/riders.module';
import { UsersController } from './users.controller';

@Module({
  imports: [DriversModule, RidersModule],
  providers: [],
  controllers: [UsersController],
})
export class UsersModule {}
