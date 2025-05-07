// rider-review.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RiderReview } from 'src/common/entities/rider_review.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RiderReviewService {
  constructor(
    @InjectRepository(RiderReview)
    private readonly reviewRepo: Repository<RiderReview>,
  ) {}

  // Get all reviews
  findAll(): Promise<RiderReview[]> {
    return this.reviewRepo.find();
  }

  // Get a single review by ID
  findOne(id: string): Promise<RiderReview | null> {
    return this.reviewRepo.findOne({ where: { id: Number(id) } });
  }

  // Create a new review
  async create(data: Partial<RiderReview>): Promise<RiderReview> {
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
    data: Partial<RiderReview>,
  ): Promise<RiderReview | null> {
    await this.reviewRepo.update(id, data);
    return this.findOne(id);
  }

  // Delete a review
  async remove(id: string): Promise<void> {
    await this.reviewRepo.delete(id);
  }
}
