import { Module } from '@nestjs/common';
import { RidesController } from './rides.controller';
import { RidesService } from './rides.service';

@Module({
  controllers: [RidesController],
  providers: [RidesService]
})
export class RidesModule {}
