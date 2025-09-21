export interface WaterUsageReading {
  id: string;
  timestamp: Date;
  gallons: number;
  flowRate: number; // gallons per minute
  pressure: number; // PSI
  temperature: number; // Fahrenheit
}

export interface HouseholdProfile {
  id: string;
  address: string;
  meterId: string;
  occupants: number;
  averageDailyUsage: number;
  baselineUsage: number;
  alertPreferences: AlertPreferences;
}

export interface AlertPreferences {
  enablePushNotifications: boolean;
  enableEmailAlerts: boolean;
  leakThreshold: number; // percentage increase
  continuousFlowMinutes: number;
}

export interface Alert {
  id: string;
  type: 'leak_detected' | 'continuous_flow' | 'usage_spike' | 'low_pressure' | 'system_maintenance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  resolved: boolean;
  householdId: string;
}

export interface Contractor {
  id: string;
  name: string;
  company: string;
  specialty: string[];
  rating: number;
  reviewCount: number;
  responseTime: string; // e.g., "Within 2 hours"
  serviceArea: string[];
  phone: string;
  email: string;
  available24h: boolean;
  emergencyService: boolean;
  certifications: string[];
  yearsExperience: number;
}

export interface ServiceRequest {
  id: string;
  householdId: string;
  contractorId?: string;
  alertId: string;
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  description: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedCost?: number;
}

export interface MunicipalData {
  totalHouseholds: number;
  activeAlerts: number;
  totalUsageToday: number;
  averageUsagePerHousehold: number;
  systemPressure: number;
  maintenanceScheduled: number;
}