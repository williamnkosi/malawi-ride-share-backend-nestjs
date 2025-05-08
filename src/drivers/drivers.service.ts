import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDriverDto } from 'src/common/dto/driver/create_driver.dto';
import { UpdateDriverDto } from 'src/common/dto/driver/update_driver.dto';
import { Driver } from 'src/common/entities/driver.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
  ) {}

  // Create a new driver
  async create(createDriverDto: CreateDriverDto): Promise<Driver> {
    const driver = this.driverRepository.create(createDriverDto);
    return this.driverRepository.save(driver);
  }

  // Get all drivers
  async findAll(): Promise<Driver[]> {
    return this.driverRepository.find();
  }

  // Get a driver by ID
  async findOne(id: string): Promise<Driver | null> {
    return this.driverRepository.findOne({ where: { id } });
  }

  // Update a driver by ID
  async update(
    id: string,
    updateDriverDto: UpdateDriverDto,
  ): Promise<Driver | null> {
    await this.driverRepository.update(id, updateDriverDto);
    return this.driverRepository.findOne({ where: { id } });
  }

  // Delete a driver by ID
  async remove(id: string): Promise<void> {
    await this.driverRepository.delete(id);
  }
}
