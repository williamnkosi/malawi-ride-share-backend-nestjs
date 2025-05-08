import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  InternalServerErrorException,
} from '@nestjs/common';

import { RiderEntity } from 'src/common/entities/rider.entity';
import { RiderService } from './riders.service';
import { ApiResponse } from 'src/common/types/api_response';
import { CreateRiderDto } from 'src/common/dto/rider/create_driver.dto';

@Controller('rider')
export class RiderController {
  constructor(private readonly riderService: RiderService) {}

  @Get()
  findAll(): Promise<RiderEntity[]> {
    return this.riderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<RiderEntity | null> {
    try {
      return this.riderService.findOne(id);
    } catch {
      throw new Error('Rider not found');
    }
  }

  @Post()
  async create(
    @Body() body: Partial<CreateRiderDto>,
  ): Promise<ApiResponse<RiderEntity>> {
    try {
      console.log('Creating rider with data:', body);
      const response = await this.riderService.create(body);
      return new ApiResponse(true, 'Rider created successfully', response);
    } catch (error) {
      console.error('Error creating rider:', error);
      throw new InternalServerErrorException('Error creating rider');
    }
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<RiderEntity>,
  ): Promise<RiderEntity | null> {
    return this.riderService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.riderService.remove(id);
  }
}
