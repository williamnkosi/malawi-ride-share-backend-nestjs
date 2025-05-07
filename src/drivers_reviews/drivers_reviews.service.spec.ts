import { Test, TestingModule } from '@nestjs/testing';
import { DriversReviewsService } from './drivers_reviews.service';

describe('DriversReviewsService', () => {
  let service: DriversReviewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DriversReviewsService],
    }).compile();

    service = module.get<DriversReviewsService>(DriversReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
