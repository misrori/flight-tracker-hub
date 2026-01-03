import { useMemo } from 'react';
import type { Flight } from '@/types/flight';
import { getCountryStats, getFlagEmoji } from '@/lib/countries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, Plane, MapPin } from 'lucide-react';

interface CountryStatsTableProps {
  flights: Flight[];
}

export function CountryStatsTable({ flights }: CountryStatsTableProps) {
  const countryStats = useMemo(() => {
    const stats = getCountryStats(flights);
    return Array.from(stats.values())
      .sort((a, b) => b.visits - a.visits);
  }, [flights]);

  const totalVisits = countryStats.reduce((sum, c) => sum + c.visits, 0);

  return (
    <div className="glass-card animate-fade-in">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Országstatisztikák
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Melyik országban hányszor szálltak le vagy indultak
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="w-12">#</TableHead>
              <TableHead>Ország</TableHead>
              <TableHead className="text-right">Összes</TableHead>
              <TableHead className="text-right">Indulás</TableHead>
              <TableHead className="text-right">Érkezés</TableHead>
              <TableHead className="text-right">Arány</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {countryStats.map((country, index) => {
              const percentage = ((country.visits / totalVisits) * 100).toFixed(1);
              return (
                <TableRow key={country.code} className="border-border hover:bg-muted/50">
                  <TableCell className="font-mono text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getFlagEmoji(country.code)}</span>
                      <span className="font-medium">{country.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono text-primary font-semibold">
                      {country.visits}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {country.asStart}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {country.asEnd}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="font-mono text-sm text-muted-foreground w-12">
                        {percentage}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
