// rider.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';

import { Rider } from 'src/common/entities/rider.entity';
import { RiderService } from './riders.service';

@Controller('riders')
export class RiderController {
  constructor(private readonly riderService: RiderService) {}

  @Get()
  findAll(): Promise<Rider[]> {
    return this.riderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Rider | null> {
    return this.riderService.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<Rider>): Promise<Rider> {
    return this.riderService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<Rider>,
  ): Promise<Rider | null> {
    return this.riderService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.riderService.remove(id);
  }
}
