import { Injectable } from '@nestjs/common';
import { UsersService } from '../users.service';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CustomError } from 'src/common/types/customError/errorMessageResponse';
import { CreateRiderDto } from './riders.dto';
import { RiderEntity } from './rider_entity';

@Injectable()
export class RidersService extends UsersService<RiderEntity> {
  constructor(
    @InjectRepository(RiderEntity)
    private readonly riderRepository: Repository<RiderEntity>,
  ) {
    super(riderRepository);
  }

  /**
   * Create a new rider account
   */
  async create(createRiderDto: CreateRiderDto): Promise<RiderEntity> {
    try {
      await this.validateCreateData(createRiderDto);
      const rider = this.riderRepository.create(createRiderDto);
      return rider;
    } catch (error) {
      throw new CustomError('Error creating rider', 500);
    }
  }

  /**
   * Validate rider creation data
   */
  private async validateCreateData(data: CreateRiderDto): Promise<void> {
    // Check for duplicate phone number
    const existingRider = await this.riderRepository.findOne({
      where: { phoneNumber: data.phoneNumber },
    });

    if (existingRider) {
      throw new CustomError('Phone number already registered', 400);
    }

    // Check for duplicate email
    if (data.email) {
      const existingEmail = await this.riderRepository.findOne({
        where: { email: data.email },
      });

      if (existingEmail) {
        throw new CustomError('Email already registered', 400);
      }
    }

    // Check for duplicate Firebase ID
    const existingFirebase = await this.riderRepository.findOne({
      where: { firebaseId: data.firebaseId },
    });

    if (existingFirebase) {
      throw new CustomError('Firebase ID already registered', 400);
    }
  }
}
