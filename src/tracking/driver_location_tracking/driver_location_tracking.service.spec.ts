import { Test, TestingModule } from '@nestjs/testing';
import { DriverLocationTrackingService } from './driver_location_tracking.service';

describe('DriverLocationTrackingService', () => {
  let service: DriverLocationTrackingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DriverLocationTrackingService],
    }).compile();

    service = module.get<DriverLocationTrackingService>(
      DriverLocationTrackingService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
