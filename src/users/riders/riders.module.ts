import { Module } from '@nestjs/common';
import { RidersService } from './riders.service';
import { RidersController } from './riders.controller';
import { RiderEntity } from './rider_entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([RiderEntity])],
  providers: [RidersService],
  controllers: [RidersController],
})
export class RidersModule {}
