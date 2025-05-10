import { Module } from '@nestjs/common';
import { UserDeviceService } from './user_device.service';
import { UserDeviceEntity } from 'src/common/entities/user_device.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([UserDeviceEntity])],
  providers: [UserDeviceService],
  exports: [UserDeviceService],
})
export class UserDeviceModule {}
