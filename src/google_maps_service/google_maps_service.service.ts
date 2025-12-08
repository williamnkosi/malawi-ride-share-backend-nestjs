import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  Client,
  TravelMode,
  UnitSystem,
} from '@googlemaps/google-maps-services-js';
import { RouteResponseDto } from './dtos/route-response.dto';

@Injectable()
export class GoogleMapsService {
  private readonly client: Client = new Client({});

  private readonly apiKey = process.env.GOOGLE_MAPS_API_KEY;

  constructor() {
    if (!this.apiKey) {
      this.client = new Client({});
      throw new InternalServerErrorException(
        'Google Maps API key is not set in environment variables',
      );
    }
  }

  async getDistanceAndDuration(
    origin: string,
    destination: string,
  ): Promise<{ distanceKm: number; durationMin: number }> {
    try {
      const response = await this.client.distancematrix({
        params: {
          origins: [origin],
          destinations: [destination],
          mode: TravelMode.driving,
          key: this.apiKey!,
          units: UnitSystem.metric,
        },
        timeout: 1000, // optional timeout in ms
      });

      const element = response.data.rows[0].elements[0];
      return {
        distanceKm: element.distance.value / 1000, // meters to km
        durationMin: element.duration.value / 60, // seconds to minutes
      };
    } catch (error) {
      console.error('Google Maps API Error:', error);
      throw new InternalServerErrorException('Failed to calculate distance');
    }
  }

  async getAddressFromCoordinates(
    latitude: number,
    longitude: number,
  ): Promise<string> {
    try {
      const response = await this.client.reverseGeocode({
        params: {
          latlng: { lat: latitude, lng: longitude },
          key: this.apiKey!,
        },
        timeout: 1000,
      });

      if (response.data.results.length === 0) {
        throw new InternalServerErrorException('No address found for location');
      }

      return response.data.results[0].formatted_address;
    } catch (error) {
      console.error('Google Maps Geocoding API Error:', error);
      throw new InternalServerErrorException('Failed to get address');
    }
  }

  async getCoordinatesFromAddress(
    address: string,
  ): Promise<{ latitude: number; longitude: number }> {
    try {
      const response = await this.client.geocode({
        params: {
          address,
          key: this.apiKey!,
        },
        timeout: 1000,
      });

      if (response.data.results.length === 0) {
        throw new InternalServerErrorException(
          'No coordinates found for address',
        );
      }

      const location = response.data.results[0].geometry.location;
      return { latitude: location.lat, longitude: location.lng };
    } catch (error) {
      console.error('Google Maps Geocoding API Error:', error);
      throw new InternalServerErrorException('Failed to get coordinates');
    }
  }

  async calculateRoute(
    origin: string,
    destination: string,
  ): Promise<RouteResponseDto> {
    try {
      const response = await this.client.directions({
        params: {
          origin,
          destination,
          mode: TravelMode.driving,
          key: this.apiKey!,
        },
        timeout: 1000,
      });

      const route = response.data.routes[0];
      const leg = route.legs[0];

      const steps = leg.steps.map((step) => ({
        instruction: step.html_instructions.replace(/<[^>]+>/g, ''),
        distanceKm: step.distance.value / 1000,
        durationMin: step.duration.value / 60,
      }));

      return {
        distanceKm: leg.distance.value / 1000,
        durationMin: leg.duration.value / 60,
        polyline: route.overview_polyline.points, // Encoded polyline for mobile maps
        steps,
      };
    } catch (error) {
      console.error('Google Maps Directions API Error:', error);
      throw new InternalServerErrorException('Failed to calculate route');
    }
  }
}
