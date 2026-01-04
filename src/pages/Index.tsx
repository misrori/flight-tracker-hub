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
  formatDuration,
  formatCurrency 
} from '@/lib/flightData';
import type { Flight, FlightStats, DailyFlightData, MonthlyFlightData, AircraftInfo } from '@/types/flight';
import { Plane, Clock, MapPin, Banknote, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const [allFlights, setAllFlights] = useState<Flight[]>([]);
  const [aircraftList, setAircraftList] = useState<AircraftInfo[]>([]);
  const [selectedAircraft, setSelectedAircraft] = useState<string | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
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

  // Filter flights based on selected aircraft
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
              title="Megtett távolság"
              value={`${stats.totalDistanceKm.toLocaleString('hu-HU')} km`}
              subtitle={`${stats.uniqueCountries} ország`}
              icon={MapPin}
              delay={200}
            />
            <StatCard
              title="Becsült költség"
              value={formatCurrency(stats.estimatedCostEur)}
              subtitle="~€5,000/óra alapján"
              icon={Banknote}
              delay={300}
            />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map & Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Country Map */}
            <CountryMap countryVisits={countryVisits} />

            {/* Chart Section */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Repülési statisztikák</h2>
              <ViewToggle view={chartView} onViewChange={setChartView} />
            </div>
            <FlightChart
              dailyData={dailyData}
              monthlyData={monthlyData}
              view={chartView}
            />
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Aircraft Filter */}
            <AircraftFilter 
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
            Adatforrás: ADS-B Exchange | Költségbecslés AI alapján
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
