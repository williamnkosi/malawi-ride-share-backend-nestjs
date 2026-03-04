import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  controllers: [TestingController],
  imports: [NotificationsModule],
})
export class TestingModule {}
