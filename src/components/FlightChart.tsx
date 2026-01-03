import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import type { DailyFlightData, MonthlyFlightData } from '@/types/flight';
import { formatDuration, formatCurrency } from '@/lib/flightData';

interface FlightChartProps {
  dailyData: DailyFlightData[];
  monthlyData: MonthlyFlightData[];
  view: 'daily' | 'monthly';
}

const CustomTooltip = ({ active, payload, label, view }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-card p-4 border border-primary/20">
        <p className="text-foreground font-medium">
          {view === 'daily' ? label : new Date(label + '-01').toLocaleDateString('hu-HU', { year: 'numeric', month: 'long' })}
        </p>
        <p className="text-primary font-mono text-lg">
          {data.flights} járat
        </p>
        <p className="text-muted-foreground text-sm">
          {formatDuration(data.duration)}
        </p>
        {data.estimatedCost && (
          <p className="text-accent text-sm font-mono">
            ~{formatCurrency(data.estimatedCost)}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function FlightChart({ dailyData, monthlyData, view }: FlightChartProps) {
  const data = view === 'daily' ? dailyData : monthlyData;

  return (
    <div className="glass-card p-6 animate-fade-in-delay-2">
      <h3 className="text-lg font-semibold mb-4">
        {view === 'daily' ? 'Napi repülések' : 'Havi összesítés'}
      </h3>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {view === 'daily' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorFlights" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(325, 90%, 60%)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(325, 90%, 60%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 18%)" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(215, 15%, 55%)"
                tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                stroke="hsl(215, 15%, 55%)"
                tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip view={view} />} />
              <Area 
                type="monotone" 
                dataKey="flights" 
                stroke="hsl(325, 90%, 60%)" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorFlights)" 
              />
            </AreaChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 18%)" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(215, 15%, 55%)"
                tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }}
                tickFormatter={(value) => new Date(value + '-01').toLocaleDateString('hu-HU', { month: 'short' })}
              />
              <YAxis 
                stroke="hsl(215, 15%, 55%)"
                tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip view={view} />} />
              <Bar 
                dataKey="flights" 
                fill="hsl(325, 90%, 60%)" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
