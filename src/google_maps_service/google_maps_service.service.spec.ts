import { Test, TestingModule } from '@nestjs/testing';
import { GoogleMapsServiceService } from './google_maps_service.service';

describe('GoogleMapsServiceService', () => {
  let service: GoogleMapsServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleMapsServiceService],
    }).compile();

    service = module.get<GoogleMapsServiceService>(GoogleMapsServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
