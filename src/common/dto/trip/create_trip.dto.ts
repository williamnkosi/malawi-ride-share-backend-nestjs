import { IsString, ValidateNested } from 'class-validator';
import { UserLocationDto } from '../location/user_location.dto';
import { Type } from 'class-transformer';

export class CreateTripDto {
  @IsString()
  firebaseId: string;

  @ValidateNested()
  @Type(() => UserLocationDto)
  startLocation: UserLocationDto;

  @ValidateNested()
  @Type(() => UserLocationDto)
  endLocation: UserLocationDto;
}
