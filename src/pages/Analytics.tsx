import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { CountryStatsTable } from '@/components/CountryStatsTable';
import { FlightChart } from '@/components/FlightChart';
import { ViewToggle } from '@/components/ViewToggle';
import { StatCard } from '@/components/StatCard';
import { AircraftFilter } from '@/components/AircraftFilter';
import { CountryMap } from '@/components/CountryMap';
import { 
  loadFlightData, 
  getFlightStats, 
  getDailyFlightData, 
  getMonthlyFlightData,
  getAircraftList,
  getCountryVisits,
  formatDuration,
  formatCurrency 
} from '@/lib/flightData';
import type { Flight, DailyFlightData, MonthlyFlightData, FlightStats, AircraftInfo } from '@/types/flight';
import { Loader2, Globe, TrendingUp, Clock, Banknote } from 'lucide-react';

const Analytics = () => {
  const [allFlights, setAllFlights] = useState<Flight[]>([]);
  const [aircraftList, setAircraftList] = useState<AircraftInfo[]>([]);
  const [selectedAircraft, setSelectedAircraft] = useState<string | null>(null);
  const [chartView, setChartView] = useState<'daily' | 'monthly'>('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFlightData()
      .then(data => {
        setAllFlights(data);
        setAircraftList(getAircraftList(data));
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load flight data:', err);
        setLoading(false);
      });
  }, []);

  const flights = useMemo(() => {
    if (!selectedAircraft) return allFlights;
    return allFlights.filter(f => f.registration === selectedAircraft);
  }, [allFlights, selectedAircraft]);

  const stats = useMemo(() => getFlightStats(flights), [flights]);
  const dailyData = useMemo(() => getDailyFlightData(flights), [flights]);
  const monthlyData = useMemo(() => getMonthlyFlightData(flights), [flights]);
  const countryVisits = useMemo(() => getCountryVisits(flights), [flights]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Adatok betöltése...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Elemzések</h1>
            <p className="text-muted-foreground">
              Részletes statisztikák és aggregált adatok a repülésekről
            </p>
          </div>
          <div className="w-full sm:w-64">
            <AircraftFilter 
              aircraft={aircraftList}
              selectedAircraft={selectedAircraft}
              onSelectAircraft={setSelectedAircraft}
            />
          </div>
        </div>

        {/* Summary Stats */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Érintett országok"
              value={stats.uniqueCountries}
              subtitle="Különböző ország"
              icon={Globe}
              delay={0}
            />
            <StatCard
              title="Összes járat"
              value={stats.totalFlights}
              subtitle="Rögzített repülés"
              icon={TrendingUp}
              delay={100}
            />
            <StatCard
              title="Teljes repülési idő"
              value={formatDuration(stats.totalDurationMinutes)}
              subtitle={`Átlag: ${formatDuration(stats.averageFlightDuration)}`}
              icon={Clock}
              delay={200}
            />
            <StatCard
              title="Becsült összköltség"
              value={formatCurrency(stats.estimatedCostEur)}
              subtitle="AI becslés alapján"
              icon={Banknote}
              delay={300}
            />
          </div>
        )}

        {/* Country Map */}
        <div className="mb-8">
          <CountryMap countryVisits={countryVisits} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Country Stats Table */}
          <div className="lg:col-span-1">
            <CountryStatsTable flights={flights} />
          </div>

          {/* Chart Section */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Időbeli eloszlás</h2>
              <ViewToggle view={chartView} onViewChange={setChartView} />
            </div>
            <FlightChart
              dailyData={dailyData}
              monthlyData={monthlyData}
              view={chartView}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border text-center text-muted-foreground text-sm">
          <p>
            NERLines - Repülési adatok elemzése és vizualizációja
          </p>
          <p className="mt-1">
            Adatforrás: ADS-B Exchange | Költségbecslés AI alapján (~€5,000/óra)
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Analytics;
