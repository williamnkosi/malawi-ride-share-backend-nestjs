import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { CreateDriverDto } from 'src/common/dto/driver/create_driver_dto';
import { UpdateDriverDto } from 'src/common/dto/driver/update_driver_dto';
import { DriverService } from './drivers.service';

@Controller('drivers')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  // Create a new driver
  @Post()
  create(@Body() createDriverDto: CreateDriverDto) {
    return this.driverService.create(createDriverDto);
  }

  // Get all drivers
  @Get()
  findAll() {
    return this.driverService.findAll();
  }

  // Get a specific driver by ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.driverService.findOne(id);
  }

  // Update a driver
  @Put(':id')
  update(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto) {
    return this.driverService.update(id, updateDriverDto);
  }

  // Delete a driver
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.driverService.remove(id);
  }
}
