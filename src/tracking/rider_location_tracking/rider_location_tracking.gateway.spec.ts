import { Test, TestingModule } from '@nestjs/testing';
import { RiderLocationTrackingGateway } from './rider_location_tracking.gateway';

describe('RiderLocationTrackingGateway', () => {
  let gateway: RiderLocationTrackingGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RiderLocationTrackingGateway],
    }).compile();

    gateway = module.get<RiderLocationTrackingGateway>(RiderLocationTrackingGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
