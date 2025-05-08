import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDeviceDto } from 'src/common/dto/user_device/create_user_device.dto';
import { UpdateUserDeviceDto } from 'src/common/dto/user_device/update_user_device.dto';
import { UserDevice } from 'src/common/entities/user_device.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserDeviceService {
  constructor(
    @InjectRepository(UserDevice)
    private userDeviceRepository: Repository<UserDevice>,
  ) {}

  async create(createUserDeviceDto: CreateUserDeviceDto): Promise<UserDevice> {
    const userDevice = this.userDeviceRepository.create(createUserDeviceDto);
    return await this.userDeviceRepository.save(userDevice);
  }

  async findAll(): Promise<UserDevice[]> {
    return await this.userDeviceRepository.find();
  }

  async findOne(id: string): Promise<UserDevice> {
    const device = await this.userDeviceRepository.findOne({ where: { id } });
    if (!device) throw new NotFoundException(`UserDevice ${id} not found`);
    return device;
  }

  async update(
    id: string,
    updateUserDeviceDto: UpdateUserDeviceDto,
  ): Promise<UserDevice> {
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
