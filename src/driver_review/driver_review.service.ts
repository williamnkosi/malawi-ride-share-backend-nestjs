// driver-review.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DriverReviewEntity } from 'src/common/entities/driver_review.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DriverReviewService {
  constructor(
    @InjectRepository(DriverReviewEntity)
    private readonly reviewRepo: Repository<DriverReviewEntity>,
  ) {}

  findAll(): Promise<DriverReviewEntity[]> {
    return this.reviewRepo.find();
  }

  findOne(id: string): Promise<DriverReviewEntity | null> {
    return this.reviewRepo.findOne({ where: { id: Number(id) } });
  }

  create(data: Partial<DriverReviewEntity>): Promise<DriverReviewEntity> {
    const review = this.reviewRepo.create(data);
    return this.reviewRepo.save(review);
  }

  async update(
    id: string,
    data: Partial<DriverReviewEntity>,
  ): Promise<DriverReviewEntity | null> {
    await this.reviewRepo.update(id, data);
    return this.findOne(id);
  }

  remove(id: string): Promise<void> {
    return this.reviewRepo.delete(id).then(() => {});
  }
}
