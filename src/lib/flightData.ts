import Papa from 'papaparse';
import type { Flight, FlightStats, DailyFlightData, MonthlyFlightData, CountryVisit, AircraftInfo } from '@/types/flight';

// Cost estimation: Average private jet operating cost
const COST_PER_HOUR_EUR = 5000;

export async function loadFlightData(): Promise<Flight[]> {
  const response = await fetch('./data/flight_tracker_data.csv');
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      complete: (results) => {
        const flights: Flight[] = results.data
          .filter((row: any) => (row.Registration || row.registration) && row.Date)
          .map((row: any, index: number) => {
            const registration = row.registration || row.Registration;
            return {
              id: `${registration}-${index}`,
              registration: registration,
              type: row.Type || 'Unknown',
              operator: row.Operator || '',
              date: new Date(row.Date),
              startTime: row.Start_Time || '',
              endTime: row.End_Time || '',
              durationMinutes: parseFloat(row.Duration_Min) || 0,
              startLat: parseFloat(row.Start_Lat) || 0,
              startLon: parseFloat(row.Start_Lon) || 0,
              endLat: parseFloat(row.End_Lat) || 0,
              endLon: parseFloat(row.End_Lon) || 0,
              status: row.Status || 'Landed',
              startCity: row.Start_City || '',
              startCountry: row.Start_Country || '',
              endCity: row.End_City || '',
              endCountry: row.End_Country || '',
              owner: row.owner || 'Unknown',
              icao: row.icao || '',
            };
          });
        resolve(flights);
      },
      error: (error) => reject(error),
    });
  });
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function estimateFlightCost(durationMinutes: number): number {
  const hours = durationMinutes / 60;
  return Math.round(hours * COST_PER_HOUR_EUR);
}

export function getFlightStats(flights: Flight[]): FlightStats {
  const totalDurationMinutes = flights.reduce((sum, f) => sum + f.durationMinutes, 0);
  const totalDistanceKm = flights.reduce((sum, f) => {
    return sum + calculateDistance(f.startLat, f.startLon, f.endLat, f.endLon);
  }, 0);
  const totalCost = estimateFlightCost(totalDurationMinutes);

  const countries = new Set<string>();
  flights.forEach(f => {
    if (f.startCountry) countries.add(f.startCountry);
    if (f.endCountry) countries.add(f.endCountry);
  });

  return {
    totalFlights: flights.length,
    totalDurationMinutes,
    totalDistanceKm: Math.round(totalDistanceKm),
    totalCost,
    uniqueCountries: countries.size,
    averageFlightDuration: Math.round(totalDurationMinutes / flights.length) || 0,
  };
}

export function getCountryVisits(flights: Flight[]): CountryVisit[] {
  const countryMap = new Map<string, { visits: number; departures: number; arrivals: number }>();

  flights.forEach(flight => {
    if (flight.startCountry) {
      const data = countryMap.get(flight.startCountry) || { visits: 0, departures: 0, arrivals: 0 };
      data.visits++;
      data.departures++;
      countryMap.set(flight.startCountry, data);
    }
    if (flight.endCountry) {
      const data = countryMap.get(flight.endCountry) || { visits: 0, departures: 0, arrivals: 0 };
      data.visits++;
      data.arrivals++;
      countryMap.set(flight.endCountry, data);
    }
  });

  return Array.from(countryMap.entries())
    .map(([country, data]) => ({ country, ...data }))
    .sort((a, b) => b.visits - a.visits);
}

export function getAircraftList(flights: Flight[]): AircraftInfo[] {
  const aircraftMap = new Map<string, AircraftInfo>();

  flights.forEach(flight => {
    const existing = aircraftMap.get(flight.registration);
    if (existing) {
      existing.flightCount++;
    } else {
      aircraftMap.set(flight.registration, {
        registration: flight.registration,
        type: flight.type,
        operator: flight.operator,
        flightCount: 1,
      });
    }
  });

  return Array.from(aircraftMap.values()).sort((a, b) => b.flightCount - a.flightCount);
}

export function getDailyFlightData(flights: Flight[]): DailyFlightData[] {
  const dailyMap = new Map<string, { flights: number; duration: number }>();

  flights.forEach(flight => {
    const dateStr = flight.date.toISOString().split('T')[0];
    const existing = dailyMap.get(dateStr) || { flights: 0, duration: 0 };
    dailyMap.set(dateStr, {
      flights: existing.flights + 1,
      duration: existing.duration + flight.durationMinutes,
    });
  });

  return Array.from(dailyMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getOwnerList(flights: Flight[]): string[] {
  const owners = new Set<string>();
  flights.forEach(f => {
    if (f.owner) owners.add(f.owner);
  });
  return Array.from(owners).sort();
}

export function getRegistrationsByOwner(flights: Flight[], owner: string | null): AircraftInfo[] {
  const filteredFlights = owner ? flights.filter(f => f.owner === owner) : flights;
  const aircraftMap = new Map<string, AircraftInfo>();

  filteredFlights.forEach(flight => {
    const existing = aircraftMap.get(flight.registration);
    if (existing) {
      existing.flightCount++;
    } else {
      aircraftMap.set(flight.registration, {
        registration: flight.registration,
        type: flight.type,
        operator: flight.operator,
        flightCount: 1,
      });
    }
  });

  return Array.from(aircraftMap.values()).sort((a, b) => b.flightCount - a.flightCount);
}

export function getMonthlyFlightData(flights: Flight[]): MonthlyFlightData[] {
  const monthlyMap = new Map<string, { flights: number; duration: number }>();

  flights.forEach(flight => {
    const monthStr = flight.date.toISOString().slice(0, 7);
    const existing = monthlyMap.get(monthStr) || { flights: 0, duration: 0 };
    monthlyMap.set(monthStr, {
      flights: existing.flights + 1,
      duration: existing.duration + flight.durationMinutes,
    });
  });

  return Array.from(monthlyMap.entries())
    .map(([month, data]) => ({
      month,
      flights: data.flights,
      duration: data.duration,
      estimatedCost: estimateFlightCost(data.duration),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours === 0) return `${mins}p`;
  return `${hours}ó ${mins}p`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount);
}
