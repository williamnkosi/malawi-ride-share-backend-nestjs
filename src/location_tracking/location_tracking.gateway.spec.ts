import { Test, TestingModule } from '@nestjs/testing';
import { LocationTrackingGateway } from './location_tracking.gateway';

describe('LocationTrackingGateway', () => {
  let gateway: LocationTrackingGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocationTrackingGateway],
    }).compile();

    gateway = module.get<LocationTrackingGateway>(LocationTrackingGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
