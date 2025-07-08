import { Module } from '@nestjs/common';
import { GoogleMapsService } from './google_maps_service.service';

@Module({
  providers: [GoogleMapsService],
  exports: [GoogleMapsService],
})
export class GoogleMapsServiceModule {}
