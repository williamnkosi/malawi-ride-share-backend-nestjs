import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RidesModule } from './rides/rides.module';
import { LocationModule } from './location/location.module';
import { PaymentsModule } from './payments/payments.module';
import { DriversModule } from './drivers/drivers.module';
import { FirebaseModule } from './firebase/firebase.module';
import { ConfigModule } from '@nestjs/config';
import { TestingModule } from './testing/testing.module';
import { TrackingModule } from './tracking/tracking.module';
import { RidersService } from './riders/riders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RiderModule } from './riders/riders.module';
import { RidersController } from './riders/riders.controller';
import { RiderReviewsModule } from './rider_reviews/rider_reviews.module';
import { DriversReviewsModule } from './drivers_reviews/drivers_reviews.module';
import { RidersReviewsService } from './riders_reviews/riders_reviews.service';
import { RidersReviewsController } from './riders_reviews/riders_reviews.controller';
import { RidersReviewsModule } from './riders_reviews/riders_reviews.module';
import { RiderReviewModule } from './rider_review/rider_review.module';
import { DriverReviewModule } from './driver_review/driver_review.module';
import { UserDeviceService } from './user_device/user_device.service';
import { UserDeviceModule } from './user_device/user_device.module';

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
    }),
    AuthModule,
    UsersModule,
    NotificationsModule,
    RidesModule,
    LocationModule,
    PaymentsModule,
    DriversModule,
    FirebaseModule,
    ...(!isProd ? [TestingModule] : []),
    TrackingModule,
    RiderModule,
    RidesModule,
    CoModule,
    RiderReviewsModule,
    DriversReviewsModule,
    RidersReviewsModule,
    RiderReviewModule,
    DriverReviewModule,
    UserDeviceModule,
  ],
  controllers: [AppController, RidersController, RidersReviewsController],
  providers: [AppService, RidersService, RidersReviewsService, UserDeviceService],
})
export class AppModule {}
