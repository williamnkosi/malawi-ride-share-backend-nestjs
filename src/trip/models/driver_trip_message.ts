/**
 * Driver Trip Message Events
 *
 * This enum contains all WebSocket subscription messages that drivers can send
 * to the TripGateway for trip-related operations.
 */
export enum DriverTripMessage {
  // ==================== DRIVER INCOMING MESSAGES ====================

  /**
   * Driver accepts a trip request from a rider
   * Payload: { tripId: string, driverId: string }
   */
  ACCEPT_TRIP = 'driver:accept_trip',

  /**
   * Driver rejects a trip request from a rider
   * Payload: { tripId: string, reason?: string }
   */
  REJECT_TRIP = 'driver:reject_trip',

  /**
   * Driver starts the trip (arrived at pickup and rider is in vehicle)
   * Payload: { tripId: string }
   */
  START_TRIP = 'driver:start_trip',

  /**
   * Driver completes the trip (arrived at destination)
   * Payload: { tripId: string, endLocation?: { latitude: number, longitude: number } }
   */
  COMPLETE_TRIP = 'driver:complete_trip',

  /**
   * Driver cancels an accepted trip
   * Payload: { tripId: string, reason: string }
   */
  CANCEL_TRIP = 'driver:cancel_trip',

  /**
   * Driver updates their arrival status (e.g., "arriving", "arrived")
   * Payload: { tripId: string, status: 'en_route' | 'arriving' | 'arrived' }
   */
  UPDATE_ARRIVAL_STATUS = 'driver:update_arrival_status',
}

/**
 * Driver Trip Response Events
 *
 * This enum contains all WebSocket response messages that the TripGateway
 * sends back to drivers after processing their requests.
 */
export enum DriverTripResponse {
  // ==================== DRIVER OUTGOING RESPONSES ====================

  /**
   * Confirmation that driver successfully accepted a trip
   * Payload: { tripId: string, message: string }
   */
  ACCEPTANCE_CONFIRMED = 'trip:acceptance_confirmed',

  /**
   * Confirmation that driver successfully rejected a trip
   * Payload: { tripId: string, message: string }
   */
  REJECTION_CONFIRMED = 'trip:rejection_confirmed',

  /**
   * Confirmation that driver successfully started a trip
   * Payload: { tripId: string, message: string }
   */
  START_CONFIRMED = 'trip:start_confirmed',

  /**
   * Confirmation that driver successfully completed a trip
   * Payload: { tripId: string, message: string }
   */
  COMPLETION_CONFIRMED = 'trip:completion_confirmed',

  /**
   * Confirmation that driver successfully cancelled a trip
   * Payload: { tripId: string, message: string }
   */
  CANCELLATION_CONFIRMED = 'trip:cancellation_confirmed',

  /**
   * Confirmation that driver successfully updated arrival status
   * Payload: { tripId: string, status: string }
   */
  STATUS_UPDATE_CONFIRMED = 'trip:status_update_confirmed',

  /**
   * Error response for any failed driver action
   * Payload: { message: string }
   */
  ERROR = 'trip:error',
}

/**
 * Rider Notification Events
 *
 * This enum contains all WebSocket messages that are sent to riders
 * as a result of driver actions.
 */
export enum RiderTripNotification {
  // ==================== RIDER NOTIFICATIONS ====================

  /**
   * Notifies rider that their trip was accepted by a driver
   * Payload: { tripId: string, driverId: string, message: string }
   */
  TRIP_ACCEPTED = 'trip:accepted',

  /**
   * Notifies rider that their trip has started
   * Payload: { tripId: string, driverId: string, message: string, startedAt: Date }
   */
  TRIP_STARTED = 'trip:started',

  /**
   * Notifies rider that their trip has been completed
   * Payload: { tripId: string, driverId: string, message: string, completedAt: Date, endLocation?: object }
   */
  TRIP_COMPLETED = 'trip:completed',

  /**
   * Notifies rider that their trip was cancelled by the driver
   * Payload: { tripId: string, driverId: string, reason: string, message: string, cancelledAt: Date }
   */
  TRIP_CANCELLED_BY_DRIVER = 'trip:cancelled_by_driver',

  /**
   * Notifies rider about driver status updates (en_route, arriving, arrived)
   * Payload: { tripId: string, driverId: string, status: string, updatedAt: Date }
   */
  DRIVER_STATUS_UPDATE = 'trip:driver_status_update',
}

/**
 * Complete Trip Message Types
 *
 * Union type of all possible trip-related WebSocket messages
 */
export type TripMessageType =
  | DriverTripMessage
  | DriverTripResponse
  | RiderTripNotification;

/**
 * Driver Trip Message Payloads
 *
 * Type definitions for the expected payloads of each driver message
 */
export interface DriverTripMessagePayloads {
  [DriverTripMessage.ACCEPT_TRIP]: {
    tripId: string;
    driverId: string;
  };

  [DriverTripMessage.REJECT_TRIP]: {
    tripId: string;
    reason?: string;
  };

  [DriverTripMessage.START_TRIP]: {
    tripId: string;
  };

  [DriverTripMessage.COMPLETE_TRIP]: {
    tripId: string;
    endLocation?: {
      latitude: number;
      longitude: number;
    };
  };

  [DriverTripMessage.CANCEL_TRIP]: {
    tripId: string;
    reason: string;
  };

  [DriverTripMessage.UPDATE_ARRIVAL_STATUS]: {
    tripId: string;
    status: 'en_route' | 'arriving' | 'arrived';
  };
}

/**
 * Helper function to get all driver subscription messages
 * @returns Array of all driver trip message strings
 */
export function getAllDriverTripMessages(): string[] {
  return Object.values(DriverTripMessage);
}

/**
 * Helper function to validate if a message is a valid driver trip message
 * @param message - The message to validate
 * @returns True if the message is a valid driver trip message
 */
export function isValidDriverTripMessage(
  message: string,
): message is DriverTripMessage {
  return Object.values(DriverTripMessage).includes(
    message as DriverTripMessage,
  );
}
