import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDeviceDto } from './create_user_device.dto';

export class UpdateUserDeviceDto extends PartialType(CreateUserDeviceDto) {}
