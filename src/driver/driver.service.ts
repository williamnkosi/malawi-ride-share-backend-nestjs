import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDriverDto } from 'src/common/dto/driver/create_driver.dto';
import { UpdateDriverDto } from 'src/common/dto/driver/update_driver.dto';
import { DriverEntity } from 'src/common/entities/driver.entity';
import { CustomError } from 'src/common/types/customError/errorMessageResponse';
import { Repository } from 'typeorm';

@Injectable()
export class DriverService {
  constructor(
    @InjectRepository(DriverEntity)
    private readonly driverRepository: Repository<DriverEntity>,
  ) {}

  // Create a new driver
  async create(createDriverDto: CreateDriverDto): Promise<DriverEntity> {
    try {
      const driver = this.driverRepository.create(createDriverDto);
      return this.driverRepository.save(driver);
    } catch (error) {
      console.error(error);
      throw new CustomError('Error creating driver');
    }
  }

  // Get all drivers
  async findAll(): Promise<DriverEntity[]> {
    return this.driverRepository.find();
  }

  // Get a driver by ID
  async findOne(id: string): Promise<DriverEntity | null> {
    return this.driverRepository.findOne({ where: { id } });
  }

  // Update a driver by ID
  async update(
    id: string,
    updateDriverDto: UpdateDriverDto,
  ): Promise<DriverEntity | null> {
    await this.driverRepository.update(id, updateDriverDto);
    return this.driverRepository.findOne({ where: { id } });
  }

  // Delete a driver by ID
  async remove(id: string): Promise<void> {
    await this.driverRepository.delete(id);
  }
}
