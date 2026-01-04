import type { AircraftInfo } from '@/types/flight';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plane } from 'lucide-react';

interface AircraftFilterProps {
  aircraft: AircraftInfo[];
  selectedAircraft: string | null;
  onSelectAircraft: (registration: string | null) => void;
}

export function AircraftFilter({ aircraft, selectedAircraft, onSelectAircraft }: AircraftFilterProps) {
  return (
    <div className="glass-card p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Plane className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">Repülőgép szűrő</span>
      </div>
      <Select 
        value={selectedAircraft || 'all'} 
        onValueChange={(val) => onSelectAircraft(val === 'all' ? null : val)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Összes repülőgép" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <span className="flex items-center gap-2">
              <span>Összes repülőgép</span>
              <span className="text-muted-foreground">({aircraft.reduce((s, a) => s + a.flightCount, 0)} járat)</span>
            </span>
          </SelectItem>
          {aircraft.map((a) => (
            <SelectItem key={a.registration} value={a.registration}>
              <span className="flex items-center gap-2">
                <span className="font-mono text-primary">{a.registration}</span>
                <span className="text-muted-foreground">{a.type}</span>
                <span className="text-muted-foreground">({a.flightCount})</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
