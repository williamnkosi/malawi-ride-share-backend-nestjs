import { Module } from '@nestjs/common';
import { RiderReviewController } from './rider_review.controller';
import { RiderReviewService } from './rider_review.service';
import { RiderReviewEntity } from 'src/common/entities/rider_review.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([RiderReviewEntity])],
  controllers: [RiderReviewController],
  providers: [RiderReviewService],
})
export class RiderReviewModule {}
