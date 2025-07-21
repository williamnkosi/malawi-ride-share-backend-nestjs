import { Module } from '@nestjs/common';
import { DriversModule } from './drivers/drivers.module';
import { RidersModule } from './riders/riders.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './users.entity';
import { DriverEntity } from './drivers/driver.entity';
import { RiderEntity } from './riders/rider.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
