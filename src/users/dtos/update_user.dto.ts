import {
  IsOptional,
  IsString,
  IsEmail,
  IsEnum,
  IsDateString,
  IsPhoneNumber,
} from 'class-validator';
import { Gender } from '../users.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsPhoneNumber('MW') // Malawi phone number validation
  phoneNumber?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: Date;

  // Note: firebaseId, id, createdAt, updatedAt are excluded
  // These fields should not be updatable by users
}
