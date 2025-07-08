import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RiderEntity } from 'src/common/entities/rider.entity';

import { RiderService } from './riders.service';
import { RiderController } from './riders.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RiderEntity])],
  controllers: [RiderController],
  providers: [RiderService],
  exports: [RiderService],
})
export class RiderModule {}
