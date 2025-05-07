import { Test, TestingModule } from '@nestjs/testing';
import { RiderReviewController } from './rider_review.controller';

describe('RiderReviewController', () => {
  let controller: RiderReviewController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RiderReviewController],
    }).compile();

    controller = module.get<RiderReviewController>(RiderReviewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
