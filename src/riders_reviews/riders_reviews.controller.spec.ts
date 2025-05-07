import { Test, TestingModule } from '@nestjs/testing';
import { RidersReviewsController } from './riders_reviews.controller';

describe('RidersReviewsController', () => {
  let controller: RidersReviewsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RidersReviewsController],
    }).compile();

    controller = module.get<RidersReviewsController>(RidersReviewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
