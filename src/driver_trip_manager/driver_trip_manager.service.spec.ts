import { Test, TestingModule } from '@nestjs/testing';
import { DriverTripManagerService } from './driver_trip_manager.service';

describe('DriverTripManagerService', () => {
  let service: DriverTripManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DriverTripManagerService],
    }).compile();

    service = module.get<DriverTripManagerService>(DriverTripManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
