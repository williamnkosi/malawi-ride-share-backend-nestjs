// driver-review.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DriverReview } from 'src/common/entities/driver_review.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DriverReviewService {
  constructor(
    @InjectRepository(DriverReview)
    private readonly reviewRepo: Repository<DriverReview>,
  ) {}

  findAll(): Promise<DriverReview[]> {
    return this.reviewRepo.find();
  }

  findOne(id: string): Promise<DriverReview | null> {
    return this.reviewRepo.findOne({ where: { id: Number(id) } });
  }

  create(data: Partial<DriverReview>): Promise<DriverReview> {
    const review = this.reviewRepo.create(data);
    return this.reviewRepo.save(review);
  }

  async update(
    id: string,
    data: Partial<DriverReview>,
  ): Promise<DriverReview | null> {
    await this.reviewRepo.update(id, data);
    return this.findOne(id);
  }

  remove(id: string): Promise<void> {
    return this.reviewRepo.delete(id).then(() => {});
  }
}
