import { Module } from '@nestjs/common';
import { GoogleMapsServiceService } from './google_maps_service.service';

@Module({
  providers: [GoogleMapsServiceService]
})
export class GoogleMapsServiceModule {}
