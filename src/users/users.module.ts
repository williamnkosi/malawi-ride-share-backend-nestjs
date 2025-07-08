import { Module } from '@nestjs/common';
import { DriversModule } from './drivers/drivers.module';
import { RidersModule } from './riders/riders.module';

@Module({
  imports: [DriversModule, RidersModule],
  providers: [],
})
export class UsersModule {}
