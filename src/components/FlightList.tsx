import { useNavigate } from 'react-router-dom';
import type { Flight } from '@/types/flight';
import { formatDuration, formatCurrency, estimateFlightCost, calculateDistance } from '@/lib/flightData';
import { getCountryFromCoords, getFlagEmoji } from '@/lib/countries';
import { Plane, Clock, Route, DollarSign, ExternalLink } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FlightListProps {
  flights: Flight[];
  selectedFlight: Flight | null;
  onSelectFlight: (flight: Flight) => void;
}

export function FlightList({ flights, selectedFlight, onSelectFlight }: FlightListProps) {
  const navigate = useNavigate();

  const handleFlightClick = (flight: Flight, index: number) => {
    onSelectFlight(flight);
    navigate(`/flight/${index}`);
  };

  return (
    <div className="glass-card animate-fade-in-delay-3">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Plane className="w-5 h-5 text-primary" />
          Járatok ({flights.length})
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Kattints egy járatra a részletekért
        </p>
      </div>
      
      <ScrollArea className="h-[400px]">
        <div className="divide-y divide-border">
          {flights.map((flight, index) => {
            const distance = calculateDistance(
              flight.startLat, flight.startLon,
              flight.endLat, flight.endLon
            );
            const cost = estimateFlightCost(flight.durationMinutes);
            const isSelected = selectedFlight === flight;
            const startCountry = getCountryFromCoords(flight.startLat, flight.startLon);
            const endCountry = getCountryFromCoords(flight.endLat, flight.endLon);

            return (
              <button
                key={`${flight.icao}-${index}`}
                onClick={() => handleFlightClick(flight, index)}
                className={`w-full p-4 text-left transition-all hover:bg-muted/50 group ${
                  isSelected ? 'bg-primary/10 border-l-2 border-l-primary' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-mono text-primary font-semibold">
                      {flight.registration}
                    </span>
                    <span className="text-muted-foreground text-sm ml-2">
                      {flight.type}
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Route with flags */}
                <div className="flex items-center gap-2 mb-2 text-sm">
                  <span>{getFlagEmoji(startCountry.code)}</span>
                  <span className="text-muted-foreground">→</span>
                  <span>{getFlagEmoji(endCountry.code)}</span>
                  <span className="text-muted-foreground ml-auto">
                    {flight.startTime.toLocaleDateString('hu-HU', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{formatDuration(flight.durationMinutes)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Route className="w-3 h-3" />
                    <span>{Math.round(distance)} km</span>
                  </div>
                  <div className="flex items-center gap-1 text-accent font-mono">
                    <DollarSign className="w-3 h-3" />
                    <span>~{formatCurrency(cost)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
