import { Test, TestingModule } from '@nestjs/testing';
import { RiderLocationTrackingController } from './rider_location_tracking.controller';

describe('RiderLocationTrackingController', () => {
  let controller: RiderLocationTrackingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RiderLocationTrackingController],
    }).compile();

    controller = module.get<RiderLocationTrackingController>(RiderLocationTrackingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
