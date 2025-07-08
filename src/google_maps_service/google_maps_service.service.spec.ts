import { Test, TestingModule } from '@nestjs/testing';
import { GoogleMapsService } from './google_maps_service.service';

describe('GoogleMapsServiceService', () => {
  let service: GoogleMapsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleMapsService],
    }).compile();

    service = module.get<GoogleMapsService>(GoogleMapsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
