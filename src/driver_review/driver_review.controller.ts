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

import { DriverReviewEntity } from 'src/common/entities/driver_review.entity';
import { DriverReviewService } from './driver_review.service';

@Controller('driver-reviews')
export class DriverReviewEntityController {
  constructor(private readonly reviewService: DriverReviewService) {}

  @Get()
  findAll(): Promise<DriverReviewEntity[]> {
    return this.reviewService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<DriverReviewEntity | null> {
    return this.reviewService.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<DriverReviewEntity>,
  ): Promise<DriverReviewEntity> {
    return this.reviewService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<DriverReviewEntity>,
  ): Promise<DriverReviewEntity | null> {
    return this.reviewService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.reviewService.remove(id);
  }
}
