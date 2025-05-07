// driver-review.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { DriverReview } from 'src/common/entities/driver_review.entity';
import { DriverReviewService } from './driver_review.service';

@Controller('driver-reviews')
export class DriverReviewController {
  constructor(private readonly reviewService: DriverReviewService) {}

  @Get()
  findAll(): Promise<DriverReview[]> {
    return this.reviewService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<DriverReview | null> {
    return this.reviewService.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<DriverReview>): Promise<DriverReview> {
    return this.reviewService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<DriverReview>,
  ): Promise<DriverReview | null> {
    return this.reviewService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.reviewService.remove(id);
  }
}
