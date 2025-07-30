import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TripService {
  private readonly logger = new Logger(TripService.name);
}
