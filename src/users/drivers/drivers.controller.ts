import { Body, Controller, Post } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './drivers.dto';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}
  // @Post()
  // async createDriver(@Body() createDriverDto: CreateDriverDto) {
  //   return await this.driversService.create(createDriverDto);
  // }
}
