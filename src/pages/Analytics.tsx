import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { CountryStatsTable } from '@/components/CountryStatsTable';
import { FlightChart } from '@/components/FlightChart';
import { ViewToggle } from '@/components/ViewToggle';
import { StatCard } from '@/components/StatCard';
import { 
  loadFlightData, 
  getFlightStats, 
  getDailyFlightData, 
  getMonthlyFlightData,
  formatDuration,
  formatCurrency 
} from '@/lib/flightData';
import { getCountryStats } from '@/lib/countries';
import type { Flight, DailyFlightData, MonthlyFlightData, FlightStats } from '@/types/flight';
import { Loader2, Globe, TrendingUp, Clock, Banknote } from 'lucide-react';

const Analytics = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [stats, setStats] = useState<FlightStats | null>(null);
  const [dailyData, setDailyData] = useState<DailyFlightData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyFlightData[]>([]);
  const [chartView, setChartView] = useState<'daily' | 'monthly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [uniqueCountries, setUniqueCountries] = useState(0);

  useEffect(() => {
    loadFlightData()
      .then(data => {
        setFlights(data);
        setStats(getFlightStats(data));
        setDailyData(getDailyFlightData(data));
        setMonthlyData(getMonthlyFlightData(data));
        
        const countryStats = getCountryStats(data);
        setUniqueCountries(countryStats.size);
        
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Elemzések</h1>
          <p className="text-muted-foreground">
            Részletes statisztikák és aggregált adatok a repülésekről
          </p>
        </div>

        {/* Summary Stats */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Érintett országok"
              value={uniqueCountries}
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
