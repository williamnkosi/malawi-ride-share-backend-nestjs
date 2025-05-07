import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rider } from 'src/common/entities/rider.entity';
import { RidersController } from './riders.controller';
import { RidersService } from './riders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Rider])],
  controllers: [RidersController],
  providers: [RidersService],
})
export class RiderModule {}
