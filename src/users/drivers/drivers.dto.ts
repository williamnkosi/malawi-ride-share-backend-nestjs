import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDriverDto {
  @IsNotEmpty()
  @IsString()
  firebaseId: string;
  @IsNotEmpty()
  @IsString()
  firstName: string;
  @IsNotEmpty()
  @IsString()
  lastName: string;
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;
  @IsNotEmpty()
  @IsString()
  email: string;
  @IsNotEmpty()
  @IsString()
  driverLicenseNumber: string;
}
