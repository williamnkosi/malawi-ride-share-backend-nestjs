import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomError } from 'src/common/types/customError/errorMessageResponse';
import { Repository } from 'typeorm';
import { UserEntity } from './users.entity';
import { CreateUserDto } from './dtos/create_user.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export abstract class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async findAll(): Promise<UserEntity[]> {
    return await this.repository.find();
  }

  async findById(firebaseId: string): Promise<UserEntity> {
    const user = await this.repository.findOne({
      where: { firebaseId },
    });

    if (!user) {
      throw new NotFoundException(
        `User with firebaseId ${firebaseId} not found`,
      );
    }

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const user = this.repository.create(createUserDto);
    return await this.repository.save(user);
  }

  async update(
    firebaseId: string,
    data: Partial<UserEntity>,
  ): Promise<UserEntity> {
    const result = await this.repository.update({ firebaseId }, data);

    if (result.affected === 0) {
      throw new NotFoundException(
        `User with firebaseId ${firebaseId} not found`,
      );
    }

    return await this.findById(firebaseId);
  }
  async remove(firebaseId: string): Promise<void> {
    const result = await this.repository.delete({ firebaseId });

    if (result.affected === 0) {
      throw new NotFoundException(
        `User with firebaseId ${firebaseId} not found`,
      );
    }
  }
}
