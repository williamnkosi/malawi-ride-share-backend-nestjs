import { Test, TestingModule } from '@nestjs/testing';
import { LocationTrackingService } from './location_tracking.service';

describe('LocationTrackingService', () => {
  let service: LocationTrackingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocationTrackingService],
    }).compile();

    service = module.get<LocationTrackingService>(LocationTrackingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
