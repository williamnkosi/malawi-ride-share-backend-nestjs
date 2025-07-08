import { Expose, Type } from 'class-transformer';
import { UserLocationDto } from '../location/user_location.dto';
import { Column } from 'typeorm';
import { IsString } from 'class-validator';
import { TripEntity } from 'src/common/entities/trip/trip.entity';

export class TripDriverResponseDto {
  @Column()
  @IsString()
  tripId: string;

  @Column()
  riderfirstName: string;

  @Column()
  riderlastName: string;

  @Expose()
  @Type(() => UserLocationDto)
  startLocation: UserLocationDto;

  @Expose()
  @Type(() => UserLocationDto)
  endLocation: UserLocationDto;

  @Column()
  requestedAt: Date;

  // 🔧 Factory method to populate the DTO from the entity
  static fromTripEntity(trip: TripEntity): TripDriverResponseDto {
    const dto = new TripDriverResponseDto();
    dto.tripId = trip.id;
    dto.riderfirstName = trip.rider.firstName;
    dto.riderlastName = trip.rider.lastName;
    dto.startLocation = trip.startRiderLocation;
    dto.endLocation = trip.endRiderLocation;
    dto.requestedAt = trip.createdAt;
    return dto;
  }

  toRecord(): Record<string, any> {
    return {
      tripId: this.tripId,
      riderfirstName: this.riderfirstName,
      riderlastName: this.riderlastName,
      startLocation: {
        latitude: this.startLocation.latitude,
        longitude: this.startLocation.longitude,
      },
      endLocation: {
        latitude: this.endLocation.latitude,
        longitude: this.endLocation.longitude,
      },
      requestedAt: this.requestedAt,
    };
  }

  toRecordFirebaseMessage(): Record<string, string> {
    return {
      tripId: this.tripId ?? '',
      riderfirstName: this.riderfirstName ?? '',
      riderlastName: this.riderlastName ?? '',
      startLatitude: this.startLocation?.latitude?.toString() ?? '',
      startLongitude: this.startLocation?.longitude?.toString() ?? '',
      endLatitude: this.endLocation?.latitude?.toString() ?? '',
      endLongitude: this.endLocation?.longitude?.toString() ?? '',
      requestedAt: this.requestedAt?.toISOString() ?? '',
    };
  }
}
