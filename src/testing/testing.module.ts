import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  controllers: [TestingController],
  imports: [NotificationsModule],
})
export class TestingModule {}
