// rider-review.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RiderReviewEntity } from 'src/common/entities/rider_review.entity';

import { Repository } from 'typeorm';

@Injectable()
export class RiderReviewService {
  constructor(
    @InjectRepository(RiderReviewEntity)
    private readonly reviewRepo: Repository<RiderReviewEntity>,
  ) {}

  // Get all reviews
  findAll(): Promise<RiderReviewEntity[]> {
    return this.reviewRepo.find();
  }

  // Get a single review by ID
  findOne(id: string): Promise<RiderReviewEntity | null> {
    return this.reviewRepo.findOne({ where: { id: Number(id) } });
  }

  // Create a new review
  async create(data: Partial<RiderReviewEntity>): Promise<RiderReviewEntity> {
    // Example data processing: Check if rating is within the range
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const review = this.reviewRepo.create(data);
    return this.reviewRepo.save(review);
  }

  // Update a review
  async update(
    id: string,
    data: Partial<RiderReviewEntity>,
  ): Promise<RiderReviewEntity | null> {
    await this.reviewRepo.update(id, data);
    return this.findOne(id);
  }

  // Delete a review
  async remove(id: string): Promise<void> {
    await this.reviewRepo.delete(id);
  }
}
