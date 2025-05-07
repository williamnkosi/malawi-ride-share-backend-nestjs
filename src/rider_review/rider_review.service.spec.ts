import { Test, TestingModule } from '@nestjs/testing';
import { RiderReviewService } from './rider_review.service';

describe('RiderReviewService', () => {
  let service: RiderReviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RiderReviewService],
    }).compile();

    service = module.get<RiderReviewService>(RiderReviewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
