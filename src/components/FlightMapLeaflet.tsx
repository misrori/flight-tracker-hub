import { useEffect, useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Flight, LocationData } from '@/types/flight';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDuration, calculateDistance, estimateFlightCost, formatCurrency } from '@/lib/flightData';
import { useNavigate } from 'react-router-dom';

interface FlightMapLeafletProps {
  flights: Flight[];
  locations: LocationData[];
  selectedFlight: Flight | null;
  onSelectFlight: (flight: Flight | null) => void;
}

// Component to fit bounds when flights change
function FitBounds({ flights, selectedFlight }: { flights: Flight[]; selectedFlight: Flight | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedFlight) {
      const coords = selectedFlight.routeData.length > 0
        ? selectedFlight.routeData.map(p => [p.lat, p.lon] as [number, number])
        : [[selectedFlight.startLat, selectedFlight.startLon], [selectedFlight.endLat, selectedFlight.endLon]] as [number, number][];
      
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (flights.length > 0) {
      const allCoords: [number, number][] = [];
      flights.forEach(f => {
        allCoords.push([f.startLat, f.startLon]);
        allCoords.push([f.endLat, f.endLon]);
      });
      const bounds = L.latLngBounds(allCoords);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [flights, selectedFlight, map]);

  return null;
}

export function FlightMapLeaflet({ flights, locations, selectedFlight, onSelectFlight }: FlightMapLeafletProps) {
  const navigate = useNavigate();

  const handleFlightClick = (flight: Flight, index: number) => {
    navigate(`/flight/${index}`);
  };

  // Generate route lines
  const flightLines = useMemo(() => {
    return flights.map((flight, index) => {
      const coords = flight.routeData.length > 0
        ? flight.routeData.map(p => [p.lat, p.lon] as [number, number])
        : [[flight.startLat, flight.startLon], [flight.endLat, flight.endLon]] as [number, number][];

      const isSelected = selectedFlight === flight;

      return (
        <Polyline
          key={`route-${index}`}
          positions={coords}
          pathOptions={{
            color: isSelected ? '#e91e9e' : '#e91e9e',
            weight: isSelected ? 4 : 2,
            opacity: selectedFlight ? (isSelected ? 1 : 0.2) : 0.6,
          }}
          eventHandlers={{
            click: () => handleFlightClick(flight, index),
          }}
        />
      );
    });
  }, [flights, selectedFlight]);

  // Location heat markers
  const locationMarkers = useMemo(() => {
    const maxCount = Math.max(...locations.map(l => l.count), 1);
    return locations.map((loc, index) => {
      const radius = 5 + (loc.count / maxCount) * 20;
      return (
        <CircleMarker
          key={`loc-${index}`}
          center={[loc.lat, loc.lon]}
          radius={radius}
          pathOptions={{
            color: '#e91e9e',
            fillColor: '#e91e9e',
            fillOpacity: 0.4 + (loc.count / maxCount) * 0.4,
            weight: 1,
          }}
        >
          <Popup>
            <div className="text-sm">
              <span className="font-bold">{loc.count} látogatás</span>
            </div>
          </Popup>
        </CircleMarker>
      );
    });
  }, [locations]);

  return (
    <div className="glass-card overflow-hidden animate-fade-in-delay-1">
      <div className="relative h-[500px]">
        <MapContainer
          center={[47.4979, 19.0402]}
          zoom={4}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <FitBounds flights={flights} selectedFlight={selectedFlight} />
          {locationMarkers}
          {flightLines}
        </MapContainer>

        {/* Legend */}
        <div className="absolute top-4 left-4 glass-card p-3 text-sm z-[1000]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            <span className="text-muted-foreground">Népszerű helyek</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-primary" />
            <span className="text-muted-foreground">Útvonalak (kattints!)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
