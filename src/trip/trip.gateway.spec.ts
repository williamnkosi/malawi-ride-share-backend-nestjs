import { Test, TestingModule } from '@nestjs/testing';
import { TripGateway } from './trip.gateway';

describe('TripGateway', () => {
  let gateway: TripGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TripGateway],
    }).compile();

    gateway = module.get<TripGateway>(TripGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
