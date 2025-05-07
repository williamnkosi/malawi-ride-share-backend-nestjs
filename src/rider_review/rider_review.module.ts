import { Module } from '@nestjs/common';
import { RiderReviewController } from './rider_review.controller';
import { RiderReviewService } from './rider_review.service';

@Module({
  controllers: [RiderReviewController],
  providers: [RiderReviewService]
})
export class RiderReviewModule {}
