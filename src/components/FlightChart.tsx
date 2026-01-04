import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import type { DailyFlightData, MonthlyFlightData, Flight } from '@/types/flight';
import { formatDuration, formatCurrency } from '@/lib/flightData';

interface FlightChartProps {
  dailyData: DailyFlightData[];
  monthlyData: MonthlyFlightData[];
  flights: Flight[];
  view: 'daily' | 'monthly';
}

const ownerColors: Record<string, string> = {
  'OTP': 'hsl(142, 76%, 36%)', // Greenish for OTP
  'Mészáros': 'hsl(221, 83%, 53%)', // Blueish for Mészáros
  'Unknown': 'hsl(215, 15%, 55%)',
};

const getOwnerColor = (owner: string) => {
  if (ownerColors[owner]) return ownerColors[owner];
  // Generate a hash based color if owner is new
  let hash = 0;
  for (let i = 0; i < owner.length; i++) {
    hash = owner.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 70%, 50%)`;
};

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

export function FlightChart({ dailyData, monthlyData, flights, view }: FlightChartProps) {
  const data = view === 'daily' ? dailyData : monthlyData;

  // Determine owner for daily/monthly bars if data is filtered to one owner
  // or use a default color if mixed.
  const activeOwner = flights.length > 0 && flights.every(f => f.owner === flights[0].owner)
    ? flights[0].owner
    : null;

  const defaultColor = 'hsl(325, 90%, 60%)';
  const barColor = activeOwner ? getOwnerColor(activeOwner) : defaultColor;

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
                  <stop offset="5%" stopColor="hsl(325, 90%, 60%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(325, 90%, 60%)" stopOpacity={0} />
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
                stroke={barColor}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#colorFlights-${activeOwner || 'mixed'})`}
              />
              <defs>
                <linearGradient id={`colorFlights-${activeOwner || 'mixed'}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={barColor} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={barColor} stopOpacity={0} />
                </linearGradient>
              </defs>
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
                fill={barColor}
                radius={[4, 4, 0, 0]}
              >
                {activeOwner === null && data.map((entry: any, index: number) => {
                  // If mixed, we could try to color by dominant owner if we had that data aggregated,
                  // for now we use the theme color.
                  return <Cell key={`cell-${index}`} fill={barColor} />;
                })}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
