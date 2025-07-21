import { Injectable } from '@nestjs/common';
import { CustomError } from 'src/common/types/customError/errorMessageResponse';
import { FindOptionsWhere, Repository } from 'typeorm';
import { UserEntity } from './users.entity';

@Injectable()
export abstract class UsersService {
  constructor(protected repository: Repository<UserEntity>) {}

  async findAll(): Promise<UserEntity[]> {
    try {
      return await this.repository.find();
    } catch {
      throw new CustomError('Error fetching users', 500);
    }
  }

  async findOne(firebaseId: string): Promise<UserEntity | null> {
    try {
      return await this.repository.findOne({
        where: { firebaseId },
      });
    } catch {
      throw new CustomError('Error finding user', 500);
    }
  }
  async findById(firebaseId: string): Promise<UserEntity | null> {
    try {
      return await this.repository.findOne({
        where: { firebaseId },
      });
    } catch {
      throw new CustomError('Error finding user', 500);
    }
  }
  async update(
    firebaseId: string,
    data: Partial<UserEntity>,
  ): Promise<UserEntity | null> {
    try {
      await this.repository.update(firebaseId, data);
      return this.findById(firebaseId);
    } catch {
      throw new CustomError('Error updating user', 500);
    }
  }
  async remove(firebaseId: string): Promise<void> {
    try {
      await this.repository.delete(firebaseId);
    } catch {
      throw new CustomError('Error deleting user', 500);
    }
  }
}
