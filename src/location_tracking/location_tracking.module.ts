import { Module } from '@nestjs/common';
import { LocationTrackingController } from './location_tracking.controller';
import { LocationTrackingService } from './location_tracking.service';
import { LocationTrackingGateway } from './location_tracking.gateway';
import { UsersModule } from 'src/users/users.module';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [UsersModule, FirebaseModule],
  controllers: [LocationTrackingController],
  providers: [LocationTrackingService, LocationTrackingGateway],
  exports: [LocationTrackingService, LocationTrackingGateway],
})
export class LocationTrackingModule {}
