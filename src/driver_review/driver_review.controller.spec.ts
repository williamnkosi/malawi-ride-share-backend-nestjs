import { Test, TestingModule } from '@nestjs/testing';
import { DriverReviewController } from './driver_review.controller';

describe('DriverReviewController', () => {
  let controller: DriverReviewController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DriverReviewController],
    }).compile();

    controller = module.get<DriverReviewController>(DriverReviewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
