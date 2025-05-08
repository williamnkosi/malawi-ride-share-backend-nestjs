import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { CreateDriverDto } from 'src/common/dto/driver/create_driver.dto';
import { UpdateDriverDto } from 'src/common/dto/driver/update_driver.dto';
import { DriverService } from './driver.service';
import { CustomError } from 'src/common/types/customError/errorMessageResponse';
import { DriverEntity } from 'src/common/entities/driver.entity';
import { ApiResponse } from 'src/common/types/api_response';

@Controller('driver')
export class DriverController {
  driversService: DriverService;
  constructor(private readonly driverService: DriverService) {}

  // Create a new driver
  @Post()
  async create(
    @Body() createDriverDto: CreateDriverDto,
  ): Promise<ApiResponse<DriverEntity>> {
    try {
      const response = await this.driverService.create(createDriverDto);
      return new ApiResponse(true, 'Driver created successfully', response);
    } catch (error) {
      console.error('Error creating rider:', error);
      throw new CustomError('Error creating driver');
    }
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
