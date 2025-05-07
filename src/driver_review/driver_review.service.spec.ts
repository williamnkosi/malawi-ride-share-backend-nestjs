import { Test, TestingModule } from '@nestjs/testing';
import { DriverReviewService } from './driver_review.service';

describe('DriverReviewService', () => {
  let service: DriverReviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DriverReviewService],
    }).compile();

    service = module.get<DriverReviewService>(DriverReviewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
