import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Client, UnitSystem } from '@googlemaps/google-maps-services-js';

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
}
