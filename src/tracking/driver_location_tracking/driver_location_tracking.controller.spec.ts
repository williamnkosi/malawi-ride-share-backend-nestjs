import { Test, TestingModule } from '@nestjs/testing';
import { DriverLocationTrackingController } from './driver_location_tracking.controller';

describe('DriverLocationTrackingController', () => {
  let controller: DriverLocationTrackingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DriverLocationTrackingController],
    }).compile();

    controller = module.get<DriverLocationTrackingController>(DriverLocationTrackingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
