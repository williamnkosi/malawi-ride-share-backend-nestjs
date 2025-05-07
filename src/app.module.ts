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
import { TypeOrmModule } from '@nestjs/typeorm';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
