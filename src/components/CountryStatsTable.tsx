import type { Flight, CountryVisit } from '@/types/flight';
import { getCountryVisits } from '@/lib/flightData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Globe } from 'lucide-react';

interface CountryStatsTableProps {
  flights: Flight[];
}

const countryFlags: Record<string, string> = {
  'Magyarország': '🇭🇺',
  'Németország': '🇩🇪',
  'Svájc': '🇨🇭',
  'Egyesült Királyság': '🇬🇧',
  'Románia': '🇷🇴',
  'Bulgária': '🇧🇬',
  'Seychelle-szigetek': '🇸🇨',
  'Spanyolország': '🇪🇸',
  'Olaszország': '🇮🇹',
  'Franciaország': '🇫🇷',
  'Ausztria': '🇦🇹',
  'Horvátország': '🇭🇷',
  'Görögország': '🇬🇷',
  'Hollandia': '🇳🇱',
  'Belgium': '🇧🇪',
  'Lengyelország': '🇵🇱',
  'Csehország': '🇨🇿',
  'Szlovákia': '🇸🇰',
  'Szerbia': '🇷🇸',
  'Szlovénia': '🇸🇮',
  'Portugália': '🇵🇹',
  'Törökország': '🇹🇷',
  'Egyesült Arab Emírségek': '🇦🇪',
  'Monaco': '🇲🇨',
  // English names from CSV
  'Hungary': '🇭🇺',
  'Germany': '🇩🇪',
  'Switzerland': '🇨🇭',
  'United Kingdom': '🇬🇧',
  'Romania': '🇷🇴',
  'Bulgaria': '🇧🇬',
  'Seychelles': '🇸🇨',
  'Spain': '🇪🇸',
  'Italy': '🇮🇹',
  'France': '🇫🇷',
  'Austria': '🇦🇹',
  'Croatia': '🇭🇷',
  'Greece': '🇬🇷',
  'Netherlands': '🇳🇱',
  'Poland': '🇵🇱',
  'Czechia': '🇨🇿',
  'Slovakia': '🇸🇰',
  'Serbia': '🇷🇸',
  'Portugal': '🇵🇹',
  'Türkiye': '🇹🇷',
  'USA': '🇺🇸',
  'United States': '🇺🇸',
  'Canada': '🇨🇦',
  'Maldives': '🇲🇻',
  'South Africa': '🇿🇦',
  'Tanzania': '🇹🇿',
  'Armenia': '🇦🇲',
  'China': '🇨🇳',
  'Hong Kong': '🇭🇰',
  'Philippines': '🇵🇭',
  'Vietnam': '🇻🇳',
  'Viet Nam': '🇻🇳',
  'Taiwan': '🇹🇼',
  'Malta': '🇲🇹',
  'Iceland': '🇮🇸',
  'Albania': '🇦🇱',
};

function getFlag(country: string): string {
  return countryFlags[country] || '🏳️';
}

export function CountryStatsTable({ flights }: CountryStatsTableProps) {
  const countryVisits = getCountryVisits(flights);
  const totalVisits = countryVisits.reduce((sum, c) => sum + c.visits, 0);

  return (
    <div className="glass-card animate-fade-in">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Országstatisztikák
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Indulások és érkezések országonként
        </p>
      </div>

      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Ország</TableHead>
              <TableHead className="text-right">Összes</TableHead>
              <TableHead className="text-right">Indulás</TableHead>
              <TableHead className="text-right">Érkezés</TableHead>
              <TableHead className="text-right">Arány</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {countryVisits.map((cv) => (
              <TableRow key={cv.country}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getFlag(cv.country)}</span>
                    <span>{cv.country}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-primary">
                  {cv.visits}
                </TableCell>
                <TableCell className="text-right font-mono text-green-500">
                  {cv.departures}
                </TableCell>
                <TableCell className="text-right font-mono text-red-500">
                  {cv.arrivals}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(cv.visits / totalVisits) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-10 text-right">
                      {Math.round((cv.visits / totalVisits) * 100)}%
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
