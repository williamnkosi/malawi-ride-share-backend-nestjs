import { Test, TestingModule } from '@nestjs/testing';
import { SequentialNotifcationService } from './sequential_notifcation.service';

describe('SequentialNotifcationService', () => {
  let service: SequentialNotifcationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SequentialNotifcationService],
    }).compile();

    service = module.get<SequentialNotifcationService>(SequentialNotifcationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
