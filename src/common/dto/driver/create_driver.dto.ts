import { IsString, IsEmail, Length } from 'class-validator';

export class CreateDriverDto {
  @IsString()
  @Length(1, 50)
  firstName: string;

  @IsString()
  @Length(1, 50)
  lastName: string;

  @IsString()
  firebaseId: string;

  @IsString()
  phoneNumber: string;

  @IsEmail()
  email: string;

  @IsString()
  driverLicenseNumber: string;
}
