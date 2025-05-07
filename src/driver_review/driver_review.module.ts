import { Module } from '@nestjs/common';
import { DriverReviewController } from './driver_review.controller';
import { DriverReviewService } from './driver_review.service';

@Module({
  controllers: [DriverReviewController],
  providers: [DriverReviewService]
})
export class DriverReviewModule {}
