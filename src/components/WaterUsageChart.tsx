import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { WaterUsageReading } from '../types';
import { formatTime, formatDate, groupDataByHour, groupDataByDay } from '../utils/dateUtils';

interface WaterUsageChartProps {
  readings: WaterUsageReading[];
  viewMode: 'hour' | 'day' | 'week';
  height?: number;
}

export const WaterUsageChart: React.FC<WaterUsageChartProps> = ({ 
  readings, 
  viewMode, 
  height = 300 
}) => {
  const chartData = useMemo(() => {
    if (viewMode === 'hour') {
      // Show last 24 hours with 5-minute intervals
      const last24Hours = readings.slice(-288); // 288 readings = 24 hours
      return last24Hours.map(reading => ({
        time: formatTime(reading.timestamp),
        usage: reading.gallons,
        flowRate: reading.flowRate,
        pressure: reading.pressure,
        temperature: reading.temperature,
        timestamp: reading.timestamp
      }));
    }
    
    if (viewMode === 'day') {
      // Group by hour and show averages
      const hourGroups = groupDataByHour(readings.slice(-288));
      return hourGroups.map(group => {
        const avgUsage = group.reduce((sum, r) => sum + r.gallons, 0) / group.length;
        const avgFlow = group.reduce((sum, r) => sum + r.flowRate, 0) / group.length;
        const avgPressure = group.reduce((sum, r) => sum + r.pressure, 0) / group.length;
        const avgTemp = group.reduce((sum, r) => sum + r.temperature, 0) / group.length;
        
        return {
          time: group[0].timestamp.getHours().toString().padStart(2, '0') + ':00',
          usage: Math.round(avgUsage * 100) / 100,
          flowRate: Math.round(avgFlow * 100) / 100,
          pressure: Math.round(avgPressure * 100) / 100,
          temperature: Math.round(avgTemp * 100) / 100,
          timestamp: group[0].timestamp
        };
      });
    }
    
    // Week view - group by day
    const dayGroups = groupDataByDay(readings);
    return dayGroups.slice(-7).map(group => {
      const totalUsage = group.reduce((sum, r) => sum + r.gallons, 0);
      const avgFlow = group.reduce((sum, r) => sum + r.flowRate, 0) / group.length;
      const avgPressure = group.reduce((sum, r) => sum + r.pressure, 0) / group.length;
      const avgTemp = group.reduce((sum, r) => sum + r.temperature, 0) / group.length;
      
      return {
        time: formatDate(group[0].timestamp),
        usage: Math.round(totalUsage * 100) / 100,
        flowRate: Math.round(avgFlow * 100) / 100,
        pressure: Math.round(avgPressure * 100) / 100,
        temperature: Math.round(avgTemp * 100) / 100,
        timestamp: group[0].timestamp
      };
    });
  }, [readings, viewMode]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold text-gray-800">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name === 'usage' && `Usage: ${entry.value} gallons`}
              {entry.name === 'flowRate' && `Flow Rate: ${entry.value} gal/min`}
              {entry.name === 'pressure' && `Pressure: ${entry.value} PSI`}
              {entry.name === 'temperature' && `Temperature: ${entry.value}°F`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (viewMode === 'week') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12, fill: '#666' }}
            axisLine={{ stroke: '#e0e0e0' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#666' }}
            axisLine={{ stroke: '#e0e0e0' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="usage" 
            fill="#0ea5e9" 
            radius={[2, 2, 0, 0]}
            name="usage"
          />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="time" 
          tick={{ fontSize: 12, fill: '#666' }}
          axisLine={{ stroke: '#e0e0e0' }}
          interval={viewMode === 'hour' ? Math.floor(chartData.length / 8) : 'preserveStartEnd'}
        />
        <YAxis 
          tick={{ fontSize: 12, fill: '#666' }}
          axisLine={{ stroke: '#e0e0e0' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="flowRate"
          stroke="#0ea5e9"
          strokeWidth={2}
          fill="url(#usageGradient)"
          name="flowRate"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};