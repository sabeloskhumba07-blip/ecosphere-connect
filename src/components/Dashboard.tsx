import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Calendar, 
  Clock,
  Settings,
  Home,
  Building,
  Phone,
  LogOut
} from 'lucide-react';
import { WaterUsageChart } from './WaterUsageChart';
import { AnomalyAlerts } from './AnomalyAlerts';
import { ContractorDirectory } from './ContractorDirectory';
import { NotificationPanel } from './NotificationPanel';
import { WaterUsageReading, Alert, Contractor, MunicipalData, User, ServiceRequest } from '../types';

interface DashboardProps {
  user: User;
  readings: WaterUsageReading[];
  alerts: Alert[];
  contractors: Contractor[];
  serviceRequests: ServiceRequest[];
  municipalData: MunicipalData;
  onAcknowledgeAlert: (alertId: string) => void;
  onResolveAlert: (alertId: string) => void;
  onContactContractor: (contractor: Contractor) => void;
  onUpdateServiceRequest: (requestId: string, updates: Partial<ServiceRequest>) => void;
  onSimulateLeak: () => void;
  onStopLeak: () => void;
  isLeakActive: boolean;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  readings,
  alerts,
  contractors,
  serviceRequests,
  municipalData,
  onAcknowledgeAlert,
  onResolveAlert,
  onContactContractor,
  onUpdateServiceRequest,
  onSimulateLeak,
  onStopLeak,
  isLeakActive,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'contractors' | 'municipal'>('overview');
  const [viewMode, setViewMode] = useState<'hour' | 'day' | 'week'>('day');
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    timestamp: Date;
    type: 'info' | 'warning' | 'error' | 'success';
    read: boolean;
  }>>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const currentReading = readings[readings.length - 1];
  const todayReadings = readings.filter(r => {
    const today = new Date();
    const readingDate = r.timestamp;
    return readingDate.toDateString() === today.toDateString();
  });

  const todayUsage = todayReadings.reduce((sum, r) => sum + r.litres, 0);
  const averageFlow = todayReadings.length > 0 
    ? todayReadings.reduce((sum, r) => sum + r.flowRate, 0) / todayReadings.length 
    : 0;
  
  const activeAlerts = alerts.filter(a => !a.resolved);

  // Add notification when new alert is created
  useEffect(() => {
    if (alerts.length > 0) {
      const latestAlert = alerts[alerts.length - 1];
      if (!latestAlert.resolved && notificationsEnabled) {
        const notification = {
          id: `notif-${latestAlert.id}`,
          title: latestAlert.title,
          message: latestAlert.message,
          timestamp: latestAlert.timestamp,
          type: latestAlert.severity === 'critical' || latestAlert.severity === 'high' ? 'error' as const : 'warning' as const,
          read: false
        };
        
        setNotifications(prev => [notification, ...prev.slice(0, 9)]);
      }
    }
  }, [alerts, notificationsEnabled]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const StatCard: React.FC<{ 
    title: string; 
    value: string; 
    icon: React.ReactNode; 
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
  }> = ({ title, value, icon, change, changeType }) => (
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
        <div className="text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Droplets className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Municipal Services Portal</h1>
                <p className="text-sm text-gray-600">{user.name} - {user.role === 'resident' ? 'Resident' : 'Contractor'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Demo Controls */}
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={isLeakActive ? onStopLeak : onSimulateLeak}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-200 ${
                    isLeakActive
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isLeakActive ? 'Stop Leak Demo' : 'Simulate Leak'}
                </button>
              </div>
              
              {activeAlerts.length > 0 && (
                <div className="flex items-center space-x-1 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-sm font-medium">{activeAlerts.length} Alert{activeAlerts.length > 1 ? 's' : ''}</span>
                </div>
              )}
              
              <button
                onClick={onLogout}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Home },
              { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: activeAlerts.length },
              { id: 'contractors', label: 'Contractors', icon: Phone },
              { id: 'municipal', label: 'Municipal', icon: Building }
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
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Today's Usage"
                value={`${todayUsage.toFixed(1)}L`}
                icon={<Droplets className="h-6 w-6" />}
                change="-5% from yesterday"
                changeType="positive"
              />
              <StatCard
                title="Current Flow Rate"
                value={`${currentReading?.flowRate.toFixed(1) || '0'}L/min`}
                icon={<TrendingUp className="h-6 w-6" />}
                change={isLeakActive ? "Above normal" : "Normal"}
                changeType={isLeakActive ? "negative" : "neutral"}
              />
              <StatCard
                title="System Pressure"
                value={`${currentReading?.pressure.toFixed(1) || '0'}kPa`}
                icon={<Settings className="h-6 w-6" />}
                change="Optimal range"
                changeType="positive"
              />
              <StatCard
                title="Active Alerts"
                value={activeAlerts.length.toString()}
                icon={<AlertTriangle className="h-6 w-6" />}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Water Usage Chart */}
              <div className="xl:col-span-2">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Water Usage Analytics (Litres)</h2>
                    <div className="flex space-x-2">
                      {['hour', 'day', 'week'].map(mode => (
                        <button
                          key={mode}
                          onClick={() => setViewMode(mode as any)}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-200 ${
                            viewMode === mode
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <WaterUsageChart readings={readings} viewMode={viewMode} height={400} />
                </div>
              </div>

              {/* Notifications Panel */}
              <div>
                <NotificationPanel
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onDismiss={handleDismissNotification}
                  onToggleNotifications={() => setNotificationsEnabled(!notificationsEnabled)}
                  notificationsEnabled={notificationsEnabled}
                />
              </div>
            </div>

            {/* Alerts Section */}
            {activeAlerts.length > 0 && (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Alerts</h2>
                <AnomalyAlerts
                  alerts={alerts.slice(-3)}
                  onAcknowledge={onAcknowledgeAlert}
                  onResolve={onResolveAlert}
                />
              </div>
            )}
          </div>
        )}
                    value={`${(municipalData.totalUsageToday / 1000).toFixed(1)}kL`}
        {activeTab === 'alerts' && (
          <AnomalyAlerts
            alerts={alerts}
            onAcknowledge={onAcknowledgeAlert}
            onResolve={onResolveAlert}
          />
        )}

        {activeTab === 'contractors' && (
          <ContractorDirectory
            contractors={contractors}
            onContactContractor={onContactContractor}
          />
        )}

        {activeTab === 'municipal' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Municipal Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                  title="Total Households"
                  value={municipalData.totalHouseholds.toLocaleString()}
                  icon={<Users className="h-6 w-6" />}
                />
                <StatCard
                  title="Community Usage Today"
                  value={`${(municipalData.totalUsageToday / 1000).toFixed(1)}K gal`}
                  icon={<Droplets className="h-6 w-6" />}
                />
                <StatCard
                    value={`${municipalData.systemPressure}kPa`}
                  value={`${municipalData.systemPressure} PSI`}
                  icon={<Settings className="h-6 w-6" />}
                  change="Optimal"
                  changeType="positive"
                />
                <StatCard
                  title="Active Alerts"
                  value={municipalData.activeAlerts.toString()}
                  icon={<AlertTriangle className="h-6 w-6" />}
                />
                <StatCard
                    value={`${municipalData.averageUsagePerHousehold.toFixed(0)}L`}
                  value={`${municipalData.averageUsagePerHousehold.toFixed(0)} gal`}
                  icon={<Home className="h-6 w-6" />}
                />
                <StatCard
                  title="Scheduled Maintenance"
                  value={municipalData.maintenanceScheduled.toString()}
                  icon={<Calendar className="h-6 w-6" />}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};