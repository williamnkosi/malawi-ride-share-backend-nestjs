import { Module } from '@nestjs/common';
import { DriversModule } from './drivers/drivers.module';
import { RidersModule } from './riders/riders.module';
import { UsersService } from './users.service';

@Module({
  imports: [DriversModule, RidersModule],
  providers: [UsersService]
})
export class UsersModule {}
