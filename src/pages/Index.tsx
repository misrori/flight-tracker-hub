import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { FlightChart } from '@/components/FlightChart';
import { FlightList } from '@/components/FlightList';
import { ViewToggle } from '@/components/ViewToggle';
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
import type { Flight, FlightStats, DailyFlightData, MonthlyFlightData, AircraftInfo } from '@/types/flight';
import { Plane, Clock, MapPin, Banknote, Loader2, List, Map as MapIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FilterPanel } from '@/components/FilterPanel';
import { FlightPointMap } from '@/components/FlightPointMap';

const Index = () => {
  const [allFlights, setAllFlights] = useState<Flight[]>([]);
  const [owners, setOwners] = useState<string[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<string | null>(null);
  const [aircraftList, setAircraftList] = useState<AircraftInfo[]>([]);
  const [selectedAircraft, setSelectedAircraft] = useState<string | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
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

  // Filter flights based on selected owner and aircraft
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
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Összes járat"
              value={stats.totalFlights}
              subtitle="Rögzített repülés"
              icon={Plane}
              delay={0}
            />
            <StatCard
              title="Repülési idő"
              value={formatDuration(stats.totalDurationMinutes)}
              subtitle={`Átlag: ${formatDuration(stats.averageFlightDuration)}`}
              icon={Clock}
              delay={100}
            />
            <StatCard
              title="Összes távolság"
              value={`${stats.totalDistanceKm.toLocaleString('hu-HU')} km`}
              subtitle={`${stats.uniqueCountries} ország`}
              icon={MapPin}
              delay={200}
            />
            <StatCard
              title="Becsült összköltség"
              value={formatCurrency(stats.totalCost)}
              icon={Banknote}
              delay={300}
            />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map & Charts */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Térkép vizualizáció</h2>
              <div className="flex bg-muted p-1 rounded-lg">
                <button
                  onClick={() => setMapMode('countries')}
                  className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-all ${mapMode === 'countries' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                    }`}
                >
                  <MapIcon className="w-4 h-4" />
                  Országok
                </button>
                <button
                  onClick={() => setMapMode('points')}
                  className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-all ${mapMode === 'points' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                    }`}
                >
                  <MapPin className="w-4 h-4" />
                  Pontok
                </button>
              </div>
            </div>

            {/* Conditional Map View */}
            {mapMode === 'countries' ? (
              <CountryMap countryVisits={countryVisits} />
            ) : (
              <FlightPointMap flights={flights} />
            )}

            {/* Chart Section */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Repülési statisztikák</h2>
              <ViewToggle view={chartView} onViewChange={setChartView} />
            </div>
            <FlightChart
              dailyData={dailyData}
              monthlyData={monthlyData}
              flights={flights}
              view={chartView}
            />
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Filter Panel */}
            <FilterPanel
              owners={owners}
              selectedOwner={selectedOwner}
              onSelectOwner={handleOwnerChange}
              aircraft={aircraftList}
              selectedAircraft={selectedAircraft}
              onSelectAircraft={setSelectedAircraft}
            />

            {/* Flight List */}
            <FlightList
              flights={flights}
              selectedFlight={selectedFlight}
              onSelectFlight={setSelectedFlight}
            />
          </div>
        </div>

        {/* Quick link to analytics */}
        <div className="mt-8 text-center">
          <Link
            to="/analytics"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <span>Részletes elemzések és országstatisztikák megtekintése</span>
            <span>→</span>
          </Link>
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

export default Index;
