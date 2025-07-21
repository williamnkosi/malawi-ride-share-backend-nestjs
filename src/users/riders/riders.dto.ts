import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRiderDto {
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
}
