// rider.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RiderEntity } from 'src/common/entities/rider.entity';

import { Repository } from 'typeorm';

@Injectable()
export class RidersService {
  constructor(
    @InjectRepository(RiderEntity)
    private readonly riderRepository: Repository<RiderEntity>,
  ) {}

  async findAll(): Promise<RiderEntity[]> {
    return this.riderRepository.find();
  }

  async findOne(id: string): Promise<RiderEntity | null> {
    return this.riderRepository.findOne({ where: { id } });
  }

  async create(data: Partial<RiderEntity>): Promise<RiderEntity> {
    const rider = this.riderRepository.create(data);
    return this.riderRepository.save(rider);
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
