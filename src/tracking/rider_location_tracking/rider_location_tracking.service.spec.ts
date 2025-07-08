import { Test, TestingModule } from '@nestjs/testing';
import { RiderLocationTrackingService } from './rider_location_tracking.service';

describe('RiderLocationTrackingService', () => {
  let service: RiderLocationTrackingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RiderLocationTrackingService],
    }).compile();

    service = module.get<RiderLocationTrackingService>(RiderLocationTrackingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
