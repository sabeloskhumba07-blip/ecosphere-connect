import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  AlertTriangle, 
  Droplets, 
  MapPin,
  FileText,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { WaterUsageChart } from './WaterUsageChart';
import { ServiceRequestManagement } from './ServiceRequestManagement';
import { MunicipalReports } from './MunicipalReports';
import { WaterUsageReading, Alert, ServiceRequest, MunicipalData, User } from '../types';

interface MunicipalDashboardProps {
  user: User;
  readings: WaterUsageReading[];
  alerts: Alert[];
  serviceRequests: ServiceRequest[];
  municipalData: MunicipalData;
  onUpdateServiceRequest: (requestId: string, updates: Partial<ServiceRequest>) => void;
}

export const MunicipalDashboard: React.FC<MunicipalDashboardProps> = ({
  user,
  readings,
  alerts,
  serviceRequests,
  municipalData,
  onUpdateServiceRequest
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'service-requests' | 'reports' | 'alerts'>('overview');
  const [selectedWard, setSelectedWard] = useState<number | null>(null);

  const StatCard: React.FC<{ 
    title: string; 
    value: string; 
    icon: React.ReactNode; 
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    color?: string;
  }> = ({ title, value, icon, change, changeType, color = 'text-blue-600' }) => (
    <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${
              changeType === 'positive' ? 'text-green-600' : 
              changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className={color}>
          {icon}
        </div>
      </div>
    </div>
  );

  const urgentAlerts = alerts.filter(a => !a.resolved && (a.severity === 'high' || a.severity === 'critical'));
  const openServiceRequests = serviceRequests.filter(sr => sr.status === 'open');
  const emergencyRequests = serviceRequests.filter(sr => sr.priority === 'emergency' && sr.status !== 'completed');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{municipalData.municipalityName}</h1>
                <p className="text-sm text-gray-600">{user.department} - {user.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {urgentAlerts.length > 0 && (
                <div className="flex items-center space-x-1 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-sm font-medium">{urgentAlerts.length} Urgent Alert{urgentAlerts.length > 1 ? 's' : ''}</span>
                </div>
              )}
              {emergencyRequests.length > 0 && (
                <div className="flex items-center space-x-1 text-orange-600">
                  <Clock className="h-5 w-5" />
                  <span className="text-sm font-medium">{emergencyRequests.length} Emergency Request{emergencyRequests.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'service-requests', label: 'Service Requests', icon: FileText, badge: openServiceRequests.length },
              { id: 'reports', label: 'Reports', icon: TrendingUp },
              { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: urgentAlerts.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Households"
                value={municipalData.totalHouseholds.toLocaleString()}
                icon={<Users className="h-6 w-6" />}
                color="text-blue-600"
              />
              <StatCard
                title="Active Service Requests"
                value={openServiceRequests.length.toString()}
                icon={<FileText className="h-6 w-6" />}
                color="text-orange-600"
              />
              <StatCard
                title="Water Usage Today"
                value={`${(municipalData.totalUsageToday / 1000).toFixed(1)}kL`}
                icon={<Droplets className="h-6 w-6" />}
                change="-3% from yesterday"
                changeType="positive"
                color="text-teal-600"
              />
              <StatCard
                title="System Alerts"
                value={urgentAlerts.length.toString()}
                icon={<AlertTriangle className="h-6 w-6" />}
                color="text-red-600"
              />
            </div>

            {/* Revenue Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <StatCard
                title="Rates & Taxes Collected"
                value={`R${(municipalData.revenue.ratesCollected / 1000000).toFixed(1)}M`}
                icon={<TrendingUp className="h-6 w-6" />}
                change="+12% this month"
                changeType="positive"
                color="text-green-600"
              />
              <StatCard
                title="Water Revenue"
                value={`R${(municipalData.revenue.waterRevenue / 1000000).toFixed(1)}M`}
                icon={<Droplets className="h-6 w-6" />}
                change="+8% this month"
                changeType="positive"
                color="text-blue-600"
              />
              <StatCard
                title="Electricity Revenue"
                value={`R${(municipalData.revenue.electricityRevenue / 1000000).toFixed(1)}M`}
                icon={<TrendingUp className="h-6 w-6" />}
                change="+15% this month"
                changeType="positive"
                color="text-yellow-600"
              />
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Water Usage Trends */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Municipal Water Usage Trends</h3>
                <WaterUsageChart readings={readings} viewMode="day" height={300} />
              </div>

              {/* Recent Service Requests */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Service Requests</h3>
                <div className="space-y-3">
                  {serviceRequests.slice(0, 5).map(request => (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{request.category.charAt(0).toUpperCase() + request.category.slice(1)}</p>
                        <p className="text-sm text-gray-600">Ward {request.location.ward} - {request.location.address}</p>
                        <p className="text-xs text-gray-500">{request.createdAt.toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.priority === 'emergency' ? 'bg-red-100 text-red-800' :
                          request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {request.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === 'open' ? 'bg-blue-100 text-blue-800' :
                          request.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ward Performance */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Ward Performance Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Array.from({ length: 10 }, (_, i) => i + 1).map(wardNum => {
                  const wardRequests = serviceRequests.filter(sr => sr.location.ward === wardNum);
                  const wardAlerts = alerts.filter(a => a.wardNumber === wardNum && !a.resolved);
                  
                  return (
                    <div key={wardNum} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800">Ward {wardNum}</h4>
                        <MapPin className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600">{wardRequests.length} requests</p>
                        <p className="text-gray-600">{wardAlerts.length} alerts</p>
                        <div className="flex items-center space-x-1">
                          {wardAlerts.length === 0 ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : wardAlerts.some(a => a.severity === 'critical') ? (
                            <XCircle className="h-3 w-3 text-red-600" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 text-yellow-600" />
                          )}
                          <span className={`text-xs ${
                            wardAlerts.length === 0 ? 'text-green-600' :
                            wardAlerts.some(a => a.severity === 'critical') ? 'text-red-600' :
                            'text-yellow-600'
                          }`}>
                            {wardAlerts.length === 0 ? 'Normal' : 'Issues'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'service-requests' && (
          <ServiceRequestManagement
            serviceRequests={serviceRequests}
            onUpdateRequest={onUpdateServiceRequest}
            userRole={user.role}
          />
        )}

        {activeTab === 'reports' && (
          <MunicipalReports
            municipalData={municipalData}
            serviceRequests={serviceRequests}
            alerts={alerts}
            readings={readings}
          />
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">System Alerts by Severity</h3>
              
              {['critical', 'high', 'medium', 'low'].map(severity => {
                const severityAlerts = alerts.filter(a => a.severity === severity && !a.resolved);
                
                if (severityAlerts.length === 0) return null;
                
                return (
                  <div key={severity} className="mb-6">
                    <h4 className={`font-medium mb-3 ${
                      severity === 'critical' ? 'text-red-800' :
                      severity === 'high' ? 'text-orange-800' :
                      severity === 'medium' ? 'text-yellow-800' :
                      'text-blue-800'
                    }`}>
                      {severity.charAt(0).toUpperCase() + severity.slice(1)} Priority ({severityAlerts.length})
                    </h4>
                    
                    <div className="space-y-3">
                      {severityAlerts.map(alert => (
                        <div key={alert.id} className={`border rounded-lg p-4 ${
                          severity === 'critical' ? 'bg-red-50 border-red-200' :
                          severity === 'high' ? 'bg-orange-50 border-orange-200' :
                          severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                          'bg-blue-50 border-blue-200'
                        }`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-medium text-gray-800">{alert.title}</h5>
                              <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                <span>{alert.timestamp.toLocaleString()}</span>
                                {alert.wardNumber && <span>Ward {alert.wardNumber}</span>}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              {!alert.acknowledged && (
                                <button className="px-3 py-1 bg-white bg-opacity-80 hover:bg-opacity-100 rounded text-xs font-medium transition-colors duration-200">
                                  Acknowledge
                                </button>
                              )}
                              <button className="px-3 py-1 bg-white bg-opacity-80 hover:bg-opacity-100 rounded text-xs font-medium transition-colors duration-200">
                                Resolve
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};