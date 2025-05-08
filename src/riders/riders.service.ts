// rider.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRiderDto } from 'src/common/dto/rider/create_driver.dto';
import { RiderEntity } from 'src/common/entities/rider.entity';

import { Repository } from 'typeorm';

@Injectable()
export class RiderService {
  constructor(
    @InjectRepository(RiderEntity)
    private readonly riderRepository: Repository<RiderEntity>,
  ) {}

  async findAll(): Promise<RiderEntity[]> {
    return this.riderRepository.find();
  }

  async findOne(id: string): Promise<RiderEntity | null> {
    try {
      return this.riderRepository.findOne({ where: { firebaseId: id } });
    } catch {
      throw new Error('Error creating rider: ');
    }
  }

  async create(data: Partial<CreateRiderDto>): Promise<RiderEntity> {
    try {
      const rider = this.riderRepository.create(data);
      console.log('Creating rider with data:', data);
      return this.riderRepository.save(rider);
    } catch (error) {
      console.log(error);
      throw new Error('Error creating rider: ' + error);
    }
  }

  async update(
    id: string,
    data: Partial<RiderEntity>,
  ): Promise<RiderEntity | null> {
    await this.riderRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.riderRepository.delete(id);
  }
}
