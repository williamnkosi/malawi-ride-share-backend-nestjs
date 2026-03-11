import { Test, TestingModule } from '@nestjs/testing';
import { DriverMatchingService } from './driver_matching_service';

describe('DriverMatchingService', () => {
  let service: DriverMatchingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SequentialNotifcationService],
    }).compile();

    service = module.get<SequentialNotifcationService>(
      SequentialNotifcationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
