import { Test, TestingModule } from '@nestjs/testing';
import { LocationTrackingController } from './location_tracking.controller';

describe('LocationTrackingController', () => {
  let controller: LocationTrackingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationTrackingController],
    }).compile();

    controller = module.get<LocationTrackingController>(LocationTrackingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
