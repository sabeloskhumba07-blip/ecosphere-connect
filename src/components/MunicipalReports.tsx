import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  Users, 
  Droplets,
  FileText,
  DollarSign
} from 'lucide-react';
import { MunicipalData, ServiceRequest, Alert, WaterUsageReading } from '../types';

interface MunicipalReportsProps {
  municipalData: MunicipalData;
  serviceRequests: ServiceRequest[];
  alerts: Alert[];
  readings: WaterUsageReading[];
}

export const MunicipalReports: React.FC<MunicipalReportsProps> = ({
  municipalData,
  serviceRequests,
  alerts,
  readings
}) => {
  const [selectedReport, setSelectedReport] = useState<'overview' | 'service-requests' | 'water-usage' | 'revenue'>('overview');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // Service Request Analytics
  const serviceRequestsByCategory = serviceRequests.reduce((acc, req) => {
    acc[req.category] = (acc[req.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const serviceRequestCategoryData = Object.entries(serviceRequestsByCategory).map(([category, count]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: count,
    count
  }));

  const serviceRequestsByStatus = serviceRequests.reduce((acc, req) => {
    acc[req.status] = (acc[req.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const serviceRequestStatusData = Object.entries(serviceRequestsByStatus).map(([status, count]) => ({
    name: status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1),
    value: count
  }));

  // Ward Performance Data
  const wardData = Array.from({ length: 10 }, (_, i) => {
    const wardNum = i + 1;
    const wardRequests = serviceRequests.filter(sr => sr.location.ward === wardNum);
    const wardAlerts = alerts.filter(a => a.wardNumber === wardNum);
    
    return {
      ward: `Ward ${wardNum}`,
      requests: wardRequests.length,
      alerts: wardAlerts.length,
      completed: wardRequests.filter(r => r.status === 'completed').length
    };
  });

  // Revenue Data
  const revenueData = [
    { name: 'Rates & Taxes', amount: municipalData.revenue.ratesCollected, color: '#0ea5e9' },
    { name: 'Water', amount: municipalData.revenue.waterRevenue, color: '#06b6d4' },
    { name: 'Electricity', amount: municipalData.revenue.electricityRevenue, color: '#f59e0b' }
  ];

  // Water Usage Trends
  const dailyUsageData = readings.slice(-30).reduce((acc, reading) => {
    const date = reading.timestamp.toDateString();
    if (!acc[date]) {
      acc[date] = { date: reading.timestamp.toLocaleDateString(), usage: 0, count: 0 };
    }
    acc[date].usage += reading.litres;
    acc[date].count += 1;
    return acc;
  }, {} as Record<string, { date: string; usage: number; count: number }>);

  const waterUsageTrendData = Object.values(dailyUsageData).map(day => ({
    date: day.date,
    usage: Math.round(day.usage / day.count * 100) / 100
  }));

  const COLORS = ['#0ea5e9', '#06b6d4', '#f59e0b', '#10b981', '#f97316', '#8b5cf6'];

  const handleExportReport = () => {
    // In a real application, this would generate and download a PDF or Excel file
    const reportData = {
      municipality: municipalData.municipalityName,
      generatedAt: new Date().toISOString(),
      summary: {
        totalHouseholds: municipalData.totalHouseholds,
        totalServiceRequests: serviceRequests.length,
        activeAlerts: alerts.filter(a => !a.resolved).length,
        totalRevenue: municipalData.revenue.ratesCollected + municipalData.revenue.waterRevenue + municipalData.revenue.electricityRevenue
      },
      serviceRequests: serviceRequestsByCategory,
      wardPerformance: wardData,
      revenue: revenueData
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `municipal-report-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Municipal Reports</h2>
            <p className="text-gray-600">{municipalData.municipalityName} - Performance Analytics</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
            <button
              onClick={handleExportReport}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Report Navigation */}
        <div className="flex space-x-4">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart },
            { id: 'service-requests', label: 'Service Requests', icon: FileText },
            { id: 'water-usage', label: 'Water Usage', icon: Droplets },
            { id: 'revenue', label: 'Revenue', icon: DollarSign }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedReport(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 ${
                selectedReport === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Report Content */}
      {selectedReport === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Key Performance Indicators */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Performance Indicators</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-800">Total Households</span>
                </div>
                <span className="text-xl font-bold text-blue-600">{municipalData.totalHouseholds.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-800">Service Requests Completed</span>
                </div>
                <span className="text-xl font-bold text-green-600">
                  {serviceRequests.filter(r => r.status === 'completed').length}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Droplets className="h-5 w-5 text-teal-600" />
                  <span className="font-medium text-gray-800">Daily Water Usage</span>
                </div>
                <span className="text-xl font-bold text-teal-600">
                  {(municipalData.totalUsageToday / 1000).toFixed(1)}kL
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-gray-800">Total Revenue</span>
                </div>
                <span className="text-xl font-bold text-purple-600">
                  R{((municipalData.revenue.ratesCollected + municipalData.revenue.waterRevenue + municipalData.revenue.electricityRevenue) / 1000000).toFixed(1)}M
                </span>
              </div>
            </div>
          </div>

          {/* Ward Performance Chart */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ward Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={wardData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ward" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="requests" fill="#0ea5e9" name="Service Requests" />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedReport === 'service-requests' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service Requests by Category */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Requests by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceRequestCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {serviceRequestCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Service Requests by Status */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Requests by Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={serviceRequestStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedReport === 'water-usage' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Water Usage Trends</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={waterUsageTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="usage" stroke="#06b6d4" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedReport === 'revenue' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Breakdown */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, amount }) => `${name}: R${(amount/1000000).toFixed(1)}M`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `R${(value/1000000).toFixed(2)}M`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Summary */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Summary</h3>
            <div className="space-y-4">
              {revenueData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${item.color}10` }}>
                  <span className="font-medium text-gray-800">{item.name}</span>
                  <span className="text-lg font-bold" style={{ color: item.color }}>
                    R{(item.amount / 1000000).toFixed(2)}M
                  </span>
                </div>
              ))}
              <div className="border-t pt-3 mt-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800">Total Revenue</span>
                  <span className="text-xl font-bold text-gray-900">
                    R{(revenueData.reduce((sum, item) => sum + item.amount, 0) / 1000000).toFixed(2)}M
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};