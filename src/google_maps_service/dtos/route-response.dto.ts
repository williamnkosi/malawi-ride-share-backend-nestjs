export class RouteStepDto {
  instruction: string;
  distanceKm: number;
  durationMin: number;
}

export class RouteResponseDto {
  distanceKm: number;
  durationMin: number;
  polyline: string; // Added for mobile map rendering
  steps: RouteStepDto[];
}
