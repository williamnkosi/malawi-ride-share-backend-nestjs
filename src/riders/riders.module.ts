import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rider } from 'src/common/entities/rider.entity';
import { RiderController } from './riders.controller';
import { RidersService } from './riders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Rider])],
  controllers: [RiderController],
  providers: [RidersService],
})
export class RiderModule {}
