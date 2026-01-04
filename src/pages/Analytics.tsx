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
  getOwnerList,
  getRegistrationsByOwner,
  formatDuration,
  formatCurrency
} from '@/lib/flightData';
import type { Flight, DailyFlightData, MonthlyFlightData, FlightStats, AircraftInfo } from '@/types/flight';
import { Loader2, Globe, TrendingUp, Clock, Banknote, MapPin, Map as MapIcon } from 'lucide-react';
import { FilterPanel } from '@/components/FilterPanel';
import { FlightPointMap } from '@/components/FlightPointMap';

const Analytics = () => {
  const [allFlights, setAllFlights] = useState<Flight[]>([]);
  const [owners, setOwners] = useState<string[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<string | null>(null);
  const [aircraftList, setAircraftList] = useState<AircraftInfo[]>([]);
  const [selectedAircraft, setSelectedAircraft] = useState<string | null>(null);
  const [chartView, setChartView] = useState<'daily' | 'monthly'>('monthly');
  const [mapMode, setMapMode] = useState<'countries' | 'points'>('countries');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFlightData()
      .then(data => {
        setAllFlights(data);
        setOwners(getOwnerList(data));
        setAircraftList(getRegistrationsByOwner(data, null));
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load flight data:', err);
        setLoading(false);
      });
  }, []);

  const handleOwnerChange = (owner: string | null) => {
    setSelectedOwner(owner);
    setSelectedAircraft(null);
    setAircraftList(getRegistrationsByOwner(allFlights, owner));
  };

  const flights = useMemo(() => {
    let filtered = allFlights;
    if (selectedOwner) {
      filtered = filtered.filter(f => f.owner === selectedOwner);
    }
    if (selectedAircraft) {
      filtered = filtered.filter(f => f.registration === selectedAircraft);
    }
    return filtered;
  }, [allFlights, selectedOwner, selectedAircraft]);

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
              title="Összköltség"
              value={formatCurrency(stats.totalCost)}
              icon={Banknote}
              delay={300}
            />
          </div>
        )}

        {/* Map Visualization */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Térkép vizualizáció</h2>
            <div className="flex bg-muted p-1 rounded-lg">
              <button
                onClick={() => setMapMode('countries')}
                className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-all ${mapMode === 'countries' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                  }`}
              >
                <MapIcon className="w-4 h-4" />
                Országstatisztika
              </button>
              <button
                onClick={() => setMapMode('points')}
                className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-all ${mapMode === 'points' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                  }`}
              >
                <MapPin className="w-4 h-4" />
                Járat pontok
              </button>
            </div>
          </div>

          {mapMode === 'countries' ? (
            <CountryMap countryVisits={countryVisits} />
          ) : (
            <FlightPointMap flights={flights} />
          )}
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
              flights={flights}
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
            Adatforrás: ADS-B Exchange
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Analytics;
