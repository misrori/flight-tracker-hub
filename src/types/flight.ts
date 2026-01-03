export interface FlightPoint {
  lat: number;
  lon: number;
  alt?: number;
  timestamp?: number;
}

export interface Flight {
  icao: string;
  registration: string;
  operator: string;
  type: string;
  startTime: Date;
  endTime: Date;
  startLat: number;
  startLon: number;
  endLat: number;
  endLon: number;
  durationMinutes: number;
  pointsCount: number;
  status: string;
  routeData: FlightPoint[];
}

export interface FlightStats {
  totalFlights: number;
  totalDurationMinutes: number;
  totalDistanceKm: number;
  estimatedCostEur: number;
  countriesVisited: string[];
  averageFlightDuration: number;
}

export interface DailyFlightData {
  date: string;
  flights: number;
  duration: number;
}

export interface MonthlyFlightData {
  month: string;
  flights: number;
  duration: number;
  estimatedCost: number;
}

export interface LocationData {
  lat: number;
  lon: number;
  count: number;
  city?: string;
  country?: string;
}
