import { Module } from '@nestjs/common';

import { DriverReviewService } from './driver_review.service';
import { DriverReviewController } from './driver_review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DriverReviewEntity } from 'src/common/entities/driver_review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DriverReviewEntity])],
  controllers: [DriverReviewController],
  providers: [DriverReviewService],
})
export class DriverReviewModule {}
