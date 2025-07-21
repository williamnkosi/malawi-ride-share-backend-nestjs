import { Injectable } from '@nestjs/common';
import { DriverEntity } from './driver.entity';
import { UsersService } from '../users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomError } from 'src/common/types/customError/errorMessageResponse';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(DriverEntity)
    private readonly driverRepository: Repository<DriverEntity>,
  ) {}

  async create(createDriverDto: Partial<DriverEntity>): Promise<DriverEntity> {
    try {
      const driver = this.driverRepository.create(createDriverDto);
      return this.driverRepository.save(driver);
    } catch {
      throw new CustomError('Error creating driver', 500);
    }
  }

  // async getDriverData(): Promise<DriverEntity> {
  //   try {
  //   } catch {
  //     throw new CustomError('Could not find driver, 500');
  //   }
  // }

  // TODO - Implement additional driver-specific methods as needed
}
