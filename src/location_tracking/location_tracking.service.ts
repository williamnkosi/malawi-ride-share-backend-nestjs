import { Injectable, Logger } from '@nestjs/common';
import {
  DriverConnectionDto,
  DriverLocationDto,
  DriverStatus,
  UpdateDriverLocationDto,
} from './location_tracking.dto';
import { UserEntity } from 'src/users/users.entity';
import { UsersService } from 'src/users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthenticatedSocket } from 'src/common/guards/firebase_auth_guard_types';

@Injectable()
export class LocationTrackingService {
  private readonly logger = new Logger(LocationTrackingService.name);

  // In-memory store for real-time tracking
  private onlineDrivers = new Map<string, DriverLocationDto>(); // userId -> location
  private driverSockets = new Map<string, string>(); // userId -> socketId
  private socketDrivers = new Map<string, string>(); // socketId -> userId

  constructor(
    @InjectRepository(UserEntity) private userService: UsersService,
  ) {}

  async registerDriver(
    client: AuthenticatedSocket,
    driverConnectionDto: DriverConnectionDto,
  ): Promise<void> {
    const { initialLocation } = driverConnectionDto;
    this.logger.log(
      `Registering driver ${client.firebaseId} for real-time tracking`,
    );
    const driverUserEntity = await this.userService.findByFirebaseId(
      client.firebaseId,
    );

    this.driverSockets.set(driverUserEntity.id, client.id);
    this.socketDrivers.set(client.id, driverUserEntity.id);

    if (initialLocation) {
      const driverInfo: DriverLocationDto = {
        location: initialLocation,
        status: DriverStatus.ONLINE,
      };

      this.onlineDrivers.set(driverUserEntity.id, driverInfo);
    }
  }

  async updateDriverLocation(
    firebaseId: string,
    updateDto: UpdateDriverLocationDto,
  ): Promise<DriverLocationDto> {
    const { location, status } = updateDto;
    const driverUserEntity =
      await this.userService.findByFirebaseId(firebaseId);

    const updatedLocation: DriverLocationDto = {
      status,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
    };

    this.onlineDrivers.set(driverUserEntity.id, updatedLocation);

    this.logger.debug(
      `Updated location for driver ${driverUserEntity.id} (memory only) latitude: ${updatedLocation.location?.latitude}, longitude: ${updatedLocation.location?.longitude}`,
    );
    return updatedLocation;
  }

  updateDriverStatus(firebaseId: string, status: DriverStatus): void {
    const driver = this.onlineDrivers.get(firebaseId);
    if (driver) {
      driver.status = status; // ← Type-safe enum usage
    }
  }

  getDriverLocation(firebaseId: string): DriverLocationDto | null {
    return this.onlineDrivers.get(firebaseId) || null;
  }

  getAllOnlineDrivers(): DriverLocationDto[] {
    return Array.from(this.onlineDrivers.values()).filter(
      (driver) => driver.status === DriverStatus.ONLINE,
    );
  }

  isDriverOnline(firebaseId: string): boolean {
    const driver = this.onlineDrivers.get(firebaseId);
    return driver ? driver.status === DriverStatus.ONLINE : false;
  }

  unregisterDriver(socketId: string): void {
    const driverId = this.socketDrivers.get(socketId);
    if (!driverId) return;

    this.logger.log(`Unregistering driver ${driverId} from tracking`);

    // Mark as offline before removing
    const driver = this.onlineDrivers.get(driverId);
    if (driver) {
      driver.status = DriverStatus.OFFLINE; // ← Using enum
    }

    this.onlineDrivers.delete(driverId);
    this.driverSockets.delete(driverId);
    this.socketDrivers.delete(socketId);
  }
}
