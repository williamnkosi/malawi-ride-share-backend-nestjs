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

const isProd = process.env.NODE_ENV === 'production';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    NotificationsModule,
    RidesModule,
    LocationModule,
    PaymentsModule,
    DriversModule,
    FirebaseModule,
    ...(!isProd ? [TestingModule] : []),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
