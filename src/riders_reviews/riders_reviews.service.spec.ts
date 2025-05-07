import { Test, TestingModule } from '@nestjs/testing';
import { RidersReviewsService } from './riders_reviews.service';

describe('RidersReviewsService', () => {
  let service: RidersReviewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RidersReviewsService],
    }).compile();

    service = module.get<RidersReviewsService>(RidersReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
