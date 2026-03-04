export interface TripRequestNotification {
  tripId: string;
  pickupLocation: {
    latitude: number;
    longitude: number;
  };
  dropoffLocation: {
    latitude: number;
    longitude: number;
  };

  passengerCount: number;
  riderFirstName: string;
  riderLastName: string;
}
