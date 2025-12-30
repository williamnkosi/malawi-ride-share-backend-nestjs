import { Test, TestingModule } from '@nestjs/testing';
import { TripCommunicationService } from './trip_communication.service';

describe('TripCommunicationService', () => {
  let service: TripCommunicationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TripCommunicationService],
    }).compile();

    service = module.get<TripCommunicationService>(TripCommunicationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
