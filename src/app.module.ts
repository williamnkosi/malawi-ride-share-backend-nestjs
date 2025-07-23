import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';

import { NotificationsModule } from './notifications/notifications.module';

import { FirebaseModule } from './firebase/firebase.module';
import { ConfigModule } from '@nestjs/config';
import { TestingModule } from './testing/testing.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserDeviceModule } from './user_device/user_device.module';

import { GoogleMapsServiceModule } from './google_maps_service/google_maps_service.module';
import { LocationTrackingModule } from './location_tracking/location_tracking.module';
import { UsersModule } from './users/users.module';

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
    NotificationsModule,
    FirebaseModule,
    ...(!isProd ? [TestingModule] : []),
    UserDeviceModule,
    GoogleMapsServiceModule,
    LocationTrackingModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
