// rider.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rider } from 'src/common/entities/rider.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RiderService {
  constructor(
    @InjectRepository(Rider)
    private readonly riderRepository: Repository<Rider>,
  ) {}

  async findAll(): Promise<Rider[]> {
    return this.riderRepository.find();
  }

  async findOne(id: string): Promise<Rider | null> {
    return this.riderRepository.findOne({ where: { id } });
  }

  async create(data: Partial<Rider>): Promise<Rider> {
    const rider = this.riderRepository.create(data);
    return this.riderRepository.save(rider);
  }

  async update(id: string, data: Partial<Rider>): Promise<Rider | null> {
    await this.riderRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.riderRepository.delete(id);
  }
}
