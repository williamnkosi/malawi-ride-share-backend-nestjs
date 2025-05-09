import { IsString } from 'class-validator';
import { Column } from 'typeorm';
import { UserLocationDto } from '../location/user_location.dto';

export class CreateTripDto {
  @IsString()
  firebaseId: string;

  @Column(() => UserLocationDto)
  startLocation: UserLocationDto;

  @Column(() => UserLocationDto)
  endLocation: UserLocationDto;
}
