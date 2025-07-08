import { Injectable } from '@nestjs/common';
import { CustomError } from 'src/common/types/customError/errorMessageResponse';
import { FindOptionsWhere, Repository } from 'typeorm';
import { UserEntity } from './users.entity';

@Injectable()
export abstract class UsersService<T extends UserEntity> {
  constructor(protected repository: Repository<T>) {}

  async findAll(): Promise<T[]> {
    try {
      return await this.repository.find();
    } catch {
      throw new CustomError('Error fetching users', 500);
    }
  }

  async findOne(firebaseId: string): Promise<T | null> {
    try {
      return await this.repository.findOne({
        where: { firebaseId } as FindOptionsWhere<T>,
      });
    } catch {
      throw new CustomError('Error finding user', 500);
    }
  }
  async findById(id: string): Promise<T | null> {
    try {
      return await this.repository.findOne({
        where: { id } as FindOptionsWhere<T>,
      });
    } catch {
      throw new CustomError('Error finding user', 500);
    }
  }
  async update(id: string, data: Partial<T>): Promise<T | null> {
    try {
      await this.repository.update(id, data as any);
      return this.findById(id);
    } catch {
      throw new CustomError('Error updating user', 500);
    }
  }
  async remove(id: string): Promise<void> {
    try {
      await this.repository.delete(id);
    } catch {
      throw new CustomError('Error deleting user', 500);
    }
  }
}
