import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { NotificationsModule } from './notifications/notifications.module';

import { LocationModule } from './location/location.module';
import { PaymentsModule } from './payments/payments.module';
import { DriversModule } from './driver/driver.module';
import { FirebaseModule } from './firebase/firebase.module';
import { ConfigModule } from '@nestjs/config';
import { TestingModule } from './testing/testing.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RiderModule } from './riders/riders.module';
//import { RidersController } from './riders/riders.controller';

import { RiderReviewModule } from './rider_review/rider_review.module';
import { DriverReviewModule } from './driver_review/driver_review.module';
import { UserDeviceModule } from './user_device/user_device.module';
import { TripModule } from './trip/trip.module';
import { RiderController } from './riders/riders.controller';
import { DriverController } from './driver/driver.controller';
import { TripController } from './trip/trip.controller';
import { GoogleMapsServiceModule } from './google_maps_service/google_maps_service.module';
import { DriverLocationTrackingModule } from './tracking/driver_location_tracking/driver_location_tracking.module';
import { RiderLocationTrackingModule } from './tracking/rider_location_tracking/rider_location_tracking.module';

const isProd = process.env.NODE_ENV === 'production';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Turn off in production
      //dropSchema: !isProd, // Drop schema in development
    }),
    AuthModule,
    UsersModule,
    NotificationsModule,
    LocationModule,
    PaymentsModule,
    DriversModule,
    FirebaseModule,
    ...(!isProd ? [TestingModule] : []),
    RiderModule,
    RiderReviewModule,
    DriverReviewModule,
    UserDeviceModule,
    TripModule,
    GoogleMapsServiceModule,
    DriverLocationTrackingModule,
    RiderLocationTrackingModule,
  ],
  controllers: [RiderController, DriverController, TripController],
  providers: [],
})
export class AppModule {}
