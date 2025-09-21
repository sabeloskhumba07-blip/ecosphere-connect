export interface WaterUsageReading {
  id: string;
  timestamp: Date;
  litres: number;
  flowRate: number; // litres per minute
  pressure: number; // kPa
  temperature: number; // Celsius
}

export interface HouseholdProfile {
  id: string;
  address: string;
  suburb: string;
  ward: number;
  meterId: string;
  accountNumber: string;
  occupants: number;
  propertyType: 'residential' | 'commercial' | 'industrial';
  averageDailyUsage: number;
  baselineUsage: number;
  alertPreferences: AlertPreferences;
  ratesAccount: {
    currentBalance: number;
    lastPayment: Date;
    paymentStatus: 'current' | 'arrears' | 'suspended';
  };
}

export interface AlertPreferences {
  enablePushNotifications: boolean;
  enableSMSAlerts: boolean;
  enableEmailAlerts: boolean;
  leakThreshold: number; // percentage increase
  continuousFlowMinutes: number;
}

export interface Alert {
  id: string;
  type: 'leak_detected' | 'continuous_flow' | 'usage_spike' | 'low_pressure' | 'system_maintenance' | 'rates_overdue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  resolved: boolean;
  householdId: string;
  wardNumber?: number;
}

export interface Contractor {
  id: string;
  name: string;
  company: string;
  specialty: string[];
  rating: number;
  reviewCount: number;
  responseTime: string;
  serviceArea: string[];
  phone: string;
  email: string;
  available24h: boolean;
  emergencyService: boolean;
  certifications: string[];
  yearsExperience: number;
  beeLevel?: string; // BEE compliance level
  cidbRegistration?: string;
}

export interface ServiceRequest {
  id: string;
  householdId: string;
  contractorId?: string;
  alertId?: string;
  municipalityId: string;
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  category: 'water' | 'electricity' | 'refuse' | 'roads' | 'housing' | 'other';
  description: string;
  location: {
    address: string;
    ward: number;
    gpsCoordinates?: { lat: number; lng: number };
  };
  createdAt: Date;
  updatedAt: Date;
  estimatedCost?: number;
  actualCost?: number;
  assignedOfficer?: string;
}

export interface MunicipalData {
  municipalityName: string;
  municipalityType: 'metro' | 'local' | 'district';
  totalHouseholds: number;
  totalWards: number;
  activeAlerts: number;
  totalUsageToday: number;
  averageUsagePerHousehold: number;
  systemPressure: number;
  maintenanceScheduled: number;
  serviceRequests: {
    open: number;
    inProgress: number;
    completed: number;
  };
  revenue: {
    ratesCollected: number;
    waterRevenue: number;
    electricityRevenue: number;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'resident' | 'contractor' | 'municipal_officer' | 'municipal_admin';
  municipality?: string;
  department?: string;
  permissions: string[];
  householdId?: string;
  contractorId?: string;
}

export interface Municipality {
  id: string;
  name: string;
  type: 'metro' | 'local' | 'district';
  province: string;
  wards: number[];
  contactInfo: {
    phone: string;
    email: string;
    address: string;
    website?: string;
  };
  services: string[];
}