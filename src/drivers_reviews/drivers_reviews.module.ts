import { Module } from '@nestjs/common';
import { DriversReviewsController } from './drivers_reviews.controller';
import { DriversReviewsService } from './drivers_reviews.service';

@Module({
  controllers: [DriversReviewsController],
  providers: [DriversReviewsService]
})
export class DriversReviewsModule {}
