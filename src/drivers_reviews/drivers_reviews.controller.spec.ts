import { Test, TestingModule } from '@nestjs/testing';
import { DriversReviewsController } from './drivers_reviews.controller';

describe('DriversReviewsController', () => {
  let controller: DriversReviewsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DriversReviewsController],
    }).compile();

    controller = module.get<DriversReviewsController>(DriversReviewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
