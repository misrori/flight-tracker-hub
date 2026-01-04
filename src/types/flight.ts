export interface Flight {
  id: string;
  registration: string;
  type: string;
  operator: string;
  date: Date;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  startLat: number;
  startLon: number;
  endLat: number;
  endLon: number;
  status: string;
  startCity: string;
  startCountry: string;
  endCity: string;
  endCountry: string;
  owner: string;
  icao: string;
}

export interface FlightStats {
  totalFlights: number;
  totalDurationMinutes: number;
  totalDistanceKm: number;
  totalCost: number;
  uniqueCountries: number;
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

export interface CountryVisit {
  country: string;
  visits: number;
  departures: number;
  arrivals: number;
}

export interface AircraftInfo {
  registration: string;
  type: string;
  operator: string;
  flightCount: number;
}
