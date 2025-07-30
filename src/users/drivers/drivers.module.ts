import { Module } from '@nestjs/common';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverEntity } from './driver.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DriverEntity])],
  controllers: [DriversController],
  providers: [DriversService],
})
export class DriversModule {}
