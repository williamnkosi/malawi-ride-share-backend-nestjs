import { Test, TestingModule } from '@nestjs/testing';
import { RiderNotificationsService } from './rider_notifications.service';

describe('RiderNotificationsService', () => {
  let service: RiderNotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RiderNotificationsService],
    }).compile();

    service = module.get<RiderNotificationsService>(RiderNotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
