import { Module } from '@nestjs/common';

import { RidersController } from './riders.controller';
import { RiderEntity } from './rider.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([RiderEntity])],
  providers: [],
  controllers: [RidersController],
})
export class RidersModule {}
