import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TripNotificationEvents } from './notification_event_interface';
import { NotificationEventEmitters } from '../models/notification_event_emitters_types';

@Injectable()
export class NotificationEventEmitter {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  // ✅ Trip-related notification events
  emitTripRequested(
    data: TripNotificationEvents[NotificationEventEmitters.TRIP_REQUESTED],
  ): void {
    console.log('Emitting trip requested event:', data);
    this.eventEmitter.emit(NotificationEventEmitters.TRIP_REQUESTED, data);
  }

  emitTripAccepted(
    data: TripNotificationEvents[NotificationEventEmitters.TRIP_ACCEPTED],
  ): void {
    this.eventEmitter.emit('notification.trip.accepted', data);
  }

  emitTripStarted(
    data: TripNotificationEvents[NotificationEventEmitters.TRIP_STARTED],
  ): void {
    this.eventEmitter.emit('notification.trip.started', data);
  }

  emitTripCompleted(
    data: TripNotificationEvents[NotificationEventEmitters.TRIP_COMPLETED],
  ): void {
    this.eventEmitter.emit('notification.trip.completed', data);
  }

  emitTripCancelled(
    data: TripNotificationEvents[NotificationEventEmitters.TRIP_CANCELLED],
  ): void {
    this.eventEmitter.emit('notification.trip.cancelled', data);
  }

  emitDriversFound(
    data: TripNotificationEvents[NotificationEventEmitters.DRIVER_FOUND],
  ): void {
    this.eventEmitter.emit('notification.driver.found', data);
  }

  emitDriversNotFound(
    data: TripNotificationEvents[NotificationEventEmitters.DRIVER_NOT_FOUND],
  ): void {
    this.eventEmitter.emit('notification.driver.not_found', data);
  }

  // ✅ Listener registration with type safety
  onTripRequested(
    callback: (data: TripNotificationEvents['trip.requested']) => void,
  ): void {
    this.eventEmitter.on('notification.trip.requested', callback);
  }

  onTripAccepted(
    callback: (data: TripNotificationEvents['trip.accepted']) => void,
  ): void {
    this.eventEmitter.on('notification.trip.accepted', callback);
  }

  onDriversFound(
    callback: (data: TripNotificationEvents['driver.found']) => void,
  ): void {
    this.eventEmitter.on('notification.driver.found', callback);
  }

  // Add more listeners as needed...
}
