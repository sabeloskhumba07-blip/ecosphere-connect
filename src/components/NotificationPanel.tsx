import React from 'react';
import { Bell, BellRing, Settings, X } from 'lucide-react';

interface NotificationPanelProps {
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    timestamp: Date;
    type: 'info' | 'warning' | 'error' | 'success';
    read: boolean;
  }>;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onToggleNotifications: () => void;
  notificationsEnabled: boolean;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onMarkAsRead,
  onDismiss,
  onToggleNotifications,
  notificationsEnabled
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {notificationsEnabled ? (
            <BellRing className="h-5 w-5 text-blue-600" />
          ) : (
            <Bell className="h-5 w-5 text-gray-400" />
          )}
          <h3 className="text-lg font-semibold text-gray-800">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                {unreadCount}
              </span>
            )}
          </h3>
        </div>
        <button
          onClick={onToggleNotifications}
          className={`flex items-center px-3 py-1 rounded-md text-sm transition-colors duration-200 ${
            notificationsEnabled
              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Settings className="h-4 w-4 mr-1" />
          {notificationsEnabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No notifications</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`border rounded-lg p-3 ${getNotificationColor(notification.type)} ${
                !notification.read ? 'ring-2 ring-blue-200' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 mb-1">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-gray-700 mb-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500">
                    {notification.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {!notification.read && (
                    <button
                      onClick={() => onMarkAsRead(notification.id)}
                      className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => onDismiss(notification.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};