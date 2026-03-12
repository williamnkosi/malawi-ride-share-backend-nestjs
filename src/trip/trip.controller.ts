import { Controller } from '@nestjs/common';

import { TripService } from './trip.service';
// import { AuthenticatedRequest } from '../common/guards/firebase_auth_guard_types';

@Controller('trips')
export class TripController {
  constructor(private readonly tripService: TripService) {}
  // === RIDER ENDPOINTS ===

  // @Post('request')
  // @UseGuards(FirebaseAuthGuard)
  // async requestTrip(
  //   @Req() request: AuthenticatedRequest,
  //   @Body() requestTripDto: RequestTripDto,
  // ) {
  //   if (!request.user) {
  //     throw new Error('User not authenticated');
  //   }
  //   await this.tripService.requestTrip(requestTripDto, request.userId);

  //   return { message: 'Trip requested' };
  // }

  // @Post(':tripId/cancel')
  // async cancelTrip(@Param('tripId') tripId: string) {
  //   // Cancel trip (rider or driver)
  //   return { message: 'Trip cancelled' };
  // }

  // @Get('rider/:riderId')
  // async getRiderTrips(
  //   @Param('riderId') riderId: string,
  //   @Query('status') status?: string,
  // ) {
  //   // Get all trips for a rider
  //   // Optional filter by status (completed, active, cancelled)
  //   return { trips: [] };
  // }

  // // === DRIVER ENDPOINTS ===

  // @Post(':tripId/accept')
  // async acceptTrip(@Param('tripId') tripId: string, @Body() driverData: any) {
  //   // Driver accepts trip request
  //   return { message: 'Trip accepted' };
  // }

  // @Post(':tripId/decline')
  // async declineTrip(@Param('tripId') tripId: string, @Body() driverData: any) {
  //   // Driver declines trip request
  //   return { message: 'Trip declined' };
  // }

  // @Post(':tripId/start')
  // async startTrip(@Param('tripId') tripId: string) {
  //   // Driver starts the trip (picked up rider)
  //   return { message: 'Trip started' };
  // }

  // @Post(':tripId/complete')
  // async completeTrip(
  //   @Param('tripId') tripId: string,
  //   @Body() completionData: any,
  // ) {
  //   // Driver completes the trip
  //   // - Final location
  //   // - Distance/duration
  //   // - Fare calculation
  //   return { message: 'Trip completed' };
  // }

  // @Get('driver/:driverId')
  // async getDriverTrips(
  //   @Param('driverId') driverId: string,
  //   @Query('status') status?: string,
  // ) {
  //   // Get all trips for a driver
  //   return { trips: [] };
  // }

  // // === GENERAL ENDPOINTS ===

  // @Get(':tripId')
  // async getTripDetails(@Param('tripId') tripId: string) {
  //   // Get specific trip details
  //   return { trip: {} };
  // }

  // @Get('active/rider/:riderId')
  // async getActiveRiderTrip(@Param('riderId') riderId: string) {
  //   // Get rider's current active trip
  //   return { trip: null };
  // }

  // @Get('active/driver/:driverId')
  // async getActiveDriverTrip(@Param('driverId') driverId: string) {
  //   // Get driver's current active trip
  //   return { trip: null };
  // }

  // @Put(':tripId/rating')
  // async rateTrip(@Param('tripId') tripId: string, @Body() ratingData: any) {
  //   // Add rating after trip completion
  //   return { message: 'Trip rated' };
  // }

  // @Get('nearby-drivers')
  // async findNearbyDrivers(@Query() locationQuery: any) {
  //   // Find available drivers near pickup location
  //   // Used by mobile app before requesting trip
  //   return { drivers: [] };
  // }

  // @Get(':tripId/estimate')
  // async getTripEstimate(@Param('tripId') tripId: string) {
  //   // Get fare estimate for trip
  //   return { estimate: {} };
  // }
}
