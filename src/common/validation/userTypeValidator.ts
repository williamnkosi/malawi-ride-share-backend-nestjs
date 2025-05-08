import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { UserType } from '../dto/location/user_type';

@Injectable()
export class UserValidationPipe implements PipeTransform {
  transform(value: string) {
    const type = UserType[value as keyof typeof UserType]; // This maps the string to the enum value
    if (!type) {
      throw new BadRequestException('Invalid role');
    }
    return type;
  }
}
