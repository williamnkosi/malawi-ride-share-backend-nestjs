import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDeviceDto } from 'src/common/dto/user_device/create_user_device.dto';
import { UpdateUserDeviceDto } from 'src/common/dto/user_device/update_user_device.dto';
import { UserDeviceEntity } from 'src/common/entities/user_device.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserDeviceService {
  constructor(
    @InjectRepository(UserDeviceEntity)
    private userDeviceRepository: Repository<UserDeviceEntity>,
  ) {}

  async create(
    createUserDeviceDto: CreateUserDeviceDto,
  ): Promise<UserDeviceEntity> {
    const userDevice = this.userDeviceRepository.create(createUserDeviceDto);
    return await this.userDeviceRepository.save(userDevice);
  }

  async registerOrUpdateDevice(
    dto: CreateUserDeviceDto,
  ): Promise<UserDeviceEntity> {
    const existing = await this.userDeviceRepository.findOne({
      where: { firebaseUserId: dto.firebaseUserId },
    });

    if (existing) {
      // Update existing entry
      this.userDeviceRepository.merge(existing, dto);
      return await this.userDeviceRepository.save(existing);
    }

    // Create new entry
    const newDevice = this.userDeviceRepository.create(dto);
    return await this.userDeviceRepository.save(newDevice);
  }

  async findAll(): Promise<UserDeviceEntity[]> {
    return await this.userDeviceRepository.find();
  }

  async findOne(firebaseUserId: string): Promise<UserDeviceEntity> {
    const device = await this.userDeviceRepository.findOne({
      where: { firebaseUserId },
    });
    if (!device)
      throw new NotFoundException(`UserDevice ${firebaseUserId} not found`);
    return device;
  }

  async update(
    id: string,
    updateUserDeviceDto: UpdateUserDeviceDto,
  ): Promise<UserDeviceEntity> {
    const device = await this.findOne(id);
    Object.assign(device, updateUserDeviceDto);
    device.updatedAt = new Date();
    return await this.userDeviceRepository.save(device);
  }

  async remove(id: string): Promise<void> {
    const device = await this.findOne(id);
    await this.userDeviceRepository.remove(device);
  }
}
