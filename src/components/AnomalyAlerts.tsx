import React from 'react';
import { AlertTriangle, Droplets, TrendingUp, Zap, CheckCircle, X } from 'lucide-react';
import { Alert } from '../types';
import { getTimeAgo } from '../utils/dateUtils';

interface AnomalyAlertsProps {
  alerts: Alert[];
  onAcknowledge: (alertId: string) => void;
  onResolve: (alertId: string) => void;
}

export const AnomalyAlerts: React.FC<AnomalyAlertsProps> = ({
  alerts,
  onAcknowledge,
  onResolve
}) => {
  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'leak_detected':
      case 'continuous_flow':
        return <Droplets className="h-5 w-5" />;
      case 'usage_spike':
        return <TrendingUp className="h-5 w-5" />;
      case 'low_pressure':
        return <Zap className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIconColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const unresolvedAlerts = alerts.filter(alert => !alert.resolved);
  const resolvedAlerts = alerts.filter(alert => alert.resolved);

  if (alerts.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-green-800 mb-1">All Systems Normal</h3>
        <p className="text-green-700">No anomalies detected in your water usage patterns.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Alerts */}
      {unresolvedAlerts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Active Alerts</h3>
          <div className="space-y-3">
            {unresolvedAlerts.map(alert => (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`mt-1 ${getIconColor(alert.severity)}`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{alert.title}</h4>
                      <p className="text-sm mb-2">{alert.message}</p>
                      <p className="text-xs opacity-75">{getTimeAgo(alert.timestamp)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!alert.acknowledged && (
                      <button
                        onClick={() => onAcknowledge(alert.id)}
                        className="px-3 py-1 bg-white bg-opacity-80 hover:bg-opacity-100 rounded text-xs font-medium transition-colors duration-200"
                      >
                        Acknowledge
                      </button>
                    )}
                    <button
                      onClick={() => onResolve(alert.id)}
                      className="px-3 py-1 bg-white bg-opacity-80 hover:bg-opacity-100 rounded text-xs font-medium transition-colors duration-200"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolved Alerts */}
      {resolvedAlerts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-600 mb-3">Recently Resolved</h3>
          <div className="space-y-2">
            {resolvedAlerts.slice(0, 3).map(alert => (
              <div
                key={alert.id}
                className="border border-gray-200 bg-gray-50 rounded-lg p-3 opacity-75"
              >
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-700 text-sm">{alert.title}</h4>
                    <p className="text-xs text-gray-600">{getTimeAgo(alert.timestamp)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};