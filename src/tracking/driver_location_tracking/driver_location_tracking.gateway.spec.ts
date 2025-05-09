import { Test, TestingModule } from '@nestjs/testing';
import { DriverLocationTrackingGateway } from './driver_location_tracking.gateway';

describe('DriverLocationTrackingGateway', () => {
  let gateway: DriverLocationTrackingGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DriverLocationTrackingGateway],
    }).compile();

    gateway = module.get<DriverLocationTrackingGateway>(DriverLocationTrackingGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
