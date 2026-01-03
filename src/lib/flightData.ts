import Papa from 'papaparse';
import type { Flight, FlightPoint, FlightStats, DailyFlightData, MonthlyFlightData, LocationData } from '@/types/flight';

// Cost estimation based on aircraft type and flight duration
// Average private jet operating cost: €3,000-10,000 per flight hour
const COST_PER_HOUR_EUR = 5000;

export async function loadFlightData(): Promise<Flight[]> {
  const response = await fetch('/data/processed_flights.csv');
  const csvText = await response.text();
  
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      complete: (results) => {
        const flights: Flight[] = results.data
          .filter((row: any) => row.icao && row.start_time)
          .map((row: any) => {
            let routeData: FlightPoint[] = [];
            try {
              if (row.route_data) {
                routeData = JSON.parse(row.route_data);
              }
            } catch (e) {
              console.warn('Failed to parse route data:', e);
            }

            return {
              icao: row.icao,
              registration: row.registration,
              operator: row.operator || 'Unknown',
              type: row.type || 'Private Jet',
              startTime: new Date(row.start_time),
              endTime: new Date(row.end_time),
              startLat: parseFloat(row.start_lat),
              startLon: parseFloat(row.start_lon),
              endLat: parseFloat(row.end_lat),
              endLon: parseFloat(row.end_lon),
              durationMinutes: parseFloat(row.duration_minutes) || 0,
              pointsCount: parseInt(row.points_count) || 0,
              status: row.status || 'completed',
              routeData,
            };
          });
        resolve(flights);
      },
      error: (error) => reject(error),
    });
  });
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
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
  
  const estimatedCostEur = estimateFlightCost(totalDurationMinutes);
  
  // Get unique countries (simplified - would need geocoding for real implementation)
  const locations = new Set<string>();
  flights.forEach(f => {
    locations.add(`${Math.round(f.startLat)},${Math.round(f.startLon)}`);
    locations.add(`${Math.round(f.endLat)},${Math.round(f.endLon)}`);
  });

  return {
    totalFlights: flights.length,
    totalDurationMinutes,
    totalDistanceKm: Math.round(totalDistanceKm),
    estimatedCostEur,
    countriesVisited: Array.from(locations),
    averageFlightDuration: Math.round(totalDurationMinutes / flights.length) || 0,
  };
}

export function getDailyFlightData(flights: Flight[]): DailyFlightData[] {
  const dailyMap = new Map<string, { flights: number; duration: number }>();
  
  flights.forEach(flight => {
    const dateStr = flight.startTime.toISOString().split('T')[0];
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

export function getMonthlyFlightData(flights: Flight[]): MonthlyFlightData[] {
  const monthlyMap = new Map<string, { flights: number; duration: number }>();
  
  flights.forEach(flight => {
    const monthStr = flight.startTime.toISOString().slice(0, 7);
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

export function getLocationHeatmap(flights: Flight[]): LocationData[] {
  const locationMap = new Map<string, LocationData>();
  
  flights.forEach(flight => {
    // Add start location
    const startKey = `${flight.startLat.toFixed(2)},${flight.startLon.toFixed(2)}`;
    const startData = locationMap.get(startKey) || { lat: flight.startLat, lon: flight.startLon, count: 0 };
    startData.count++;
    locationMap.set(startKey, startData);
    
    // Add end location
    const endKey = `${flight.endLat.toFixed(2)},${flight.endLon.toFixed(2)}`;
    const endData = locationMap.get(endKey) || { lat: flight.endLat, lon: flight.endLon, count: 0 };
    endData.count++;
    locationMap.set(endKey, endData);
  });

  return Array.from(locationMap.values()).sort((a, b) => b.count - a.count);
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
