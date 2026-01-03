import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { FlightChart } from '@/components/FlightChart';
import { FlightList } from '@/components/FlightList';
import { ViewToggle } from '@/components/ViewToggle';
import { 
  loadFlightData, 
  getFlightStats, 
  getDailyFlightData, 
  getMonthlyFlightData,
  getLocationHeatmap,
  formatDuration,
  formatCurrency 
} from '@/lib/flightData';
import type { Flight, FlightStats, DailyFlightData, MonthlyFlightData, LocationData } from '@/types/flight';
import { Plane, Clock, MapPin, Banknote, Loader2, Map } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [stats, setStats] = useState<FlightStats | null>(null);
  const [dailyData, setDailyData] = useState<DailyFlightData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyFlightData[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [chartView, setChartView] = useState<'daily' | 'monthly'>('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFlightData()
      .then(data => {
        setFlights(data);
        setStats(getFlightStats(data));
        setDailyData(getDailyFlightData(data));
        setMonthlyData(getMonthlyFlightData(data));
        setLocations(getLocationHeatmap(data));
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load flight data:', err);
        setLoading(false);
      });
  }, []);

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
              subtitle="Légvonalban"
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
          {/* Map placeholder & Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map info card */}
            <div className="glass-card p-8 text-center animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Map className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Interaktív térkép</h3>
              <p className="text-muted-foreground mb-4">
                Kattints egy járatra a listából az útvonal részletes megtekintéséhez és animálásához.
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-sm">
                {locations.slice(0, 5).map((loc, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary">
                    {loc.count}× ({loc.lat.toFixed(1)}°, {loc.lon.toFixed(1)}°)
                  </span>
                ))}
              </div>
            </div>

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

          {/* Flight List Sidebar */}
          <div className="lg:col-span-1">
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
