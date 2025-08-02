import { Test, TestingModule } from '@nestjs/testing';
import { DriverNotificationsService } from './driver_notifications.service';

describe('DriverNotificationsService', () => {
  let service: DriverNotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DriverNotificationsService],
    }).compile();

    service = module.get<DriverNotificationsService>(DriverNotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
