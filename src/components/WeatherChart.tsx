import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';
import { WeatherData } from '../types';

interface WeatherChartProps {
  data: WeatherData['daily'];
}

export function WeatherChart({ data }: WeatherChartProps) {
  const chartData = data.time.map((timeStr, i) => {
    const date = new Date(timeStr);
    const dt = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return {
      date: i === 0 ? 'Today' : format(dt, 'EEE'),
      fullDate: format(dt, 'MMM d, yyyy'),
      max: Math.round(data.temperature_2m_max[i]),
      min: Math.round(data.temperature_2m_min[i]),
    };
  });

  return (
    <div className="w-full h-[240px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#737373' }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#737373' }} 
            tickFormatter={(val) => `${val}°`}
          />
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-neutral-100 text-sm">
                    <p className="font-bold text-neutral-900 mb-2">{payload[0].payload.fullDate}</p>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-rose-500 font-semibold">High: {payload[0].value}°</span>
                      <span className="text-blue-500 font-semibold">Low: {payload[1].value}°</span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area 
            type="monotone" 
            dataKey="max" 
            stroke="#f43f5e" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorMax)" 
          />
          <Area 
            type="monotone" 
            dataKey="min" 
            stroke="#3b82f6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorMin)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
