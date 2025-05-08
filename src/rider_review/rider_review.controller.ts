// rider-review.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { RiderReviewService } from './rider_review.service';
import { RiderReviewEntity } from 'src/common/entities/rider_review.entity';

@Controller('rider-reviews')
export class RiderReviewController {
  constructor(private readonly reviewService: RiderReviewService) {}

  // Get all rider reviews
  @Get()
  findAll(): Promise<RiderReviewEntity[]> {
    return this.reviewService.findAll();
  }

  // Get a single review by ID
  @Get(':id')
  findOne(@Param('id') id: string): Promise<RiderReviewEntity | null> {
    return this.reviewService.findOne(id);
  }

  // Create a new review
  @Post()
  create(@Body() body: Partial<RiderReviewEntity>): Promise<RiderReviewEntity> {
    return this.reviewService.create(body);
  }

  // Update an existing review by ID
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<RiderReviewEntity>,
  ): Promise<RiderReviewEntity | null> {
    return this.reviewService.update(id, body);
  }

  // Delete a review by ID
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.reviewService.remove(id);
  }
}
