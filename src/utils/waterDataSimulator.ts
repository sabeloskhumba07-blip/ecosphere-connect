import { WaterUsageReading, HouseholdProfile, Alert, MunicipalData } from '../types';

export class WaterDataSimulator {
  private readings: WaterUsageReading[] = [];
  private alerts: Alert[] = [];
  private isLeakActive = false;
  private leakStartTime: Date | null = null;

  constructor(private household: HouseholdProfile) {
    this.generateBaselineData();
  }

  private generateBaselineData(): void {
    const now = new Date();
    const hoursBack = 168; // 7 days of data

    for (let i = hoursBack; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - (i * 5 * 60 * 1000)); // 5-minute intervals
      const reading = this.generateNormalReading(timestamp);
      this.readings.push(reading);
    }
  }

  private generateNormalReading(timestamp: Date): WaterUsageReading {
    const hour = timestamp.getHours();
    const dayOfWeek = timestamp.getDay();
    
    // Simulate daily usage patterns
    let baseUsage = this.household.baselineUsage;
    
    // Higher usage during morning (6-9am) and evening (5-9pm)
    if ((hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 21)) {
      baseUsage *= 1.5;
    }
    // Lower usage during night (11pm-5am)
    else if (hour >= 23 || hour <= 5) {
      baseUsage *= 0.3;
    }

    // Weekend patterns
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      baseUsage *= 1.2; // Slightly higher usage on weekends
    }

    // Add some random variation
    const variation = (Math.random() - 0.5) * 0.3;
    const gallons = Math.max(0, baseUsage * (1 + variation));
    
    return {
      id: `reading-${timestamp.getTime()}`,
      timestamp,
      gallons: Math.round(gallons * 100) / 100,
      flowRate: Math.round((gallons * 12) * 100) / 100, // Convert to flow rate
      pressure: 45 + Math.random() * 10, // 45-55 PSI
      temperature: 65 + Math.random() * 15 // 65-80°F
    };
  }

  public generateRealtimeReading(): WaterUsageReading {
    const now = new Date();
    let reading: WaterUsageReading;

    if (this.isLeakActive) {
      // Generate leak data - continuous high flow
      reading = {
        id: `reading-${now.getTime()}`,
        timestamp: now,
        gallons: 15 + Math.random() * 5, // High continuous usage
        flowRate: 180 + Math.random() * 60, // High flow rate
        pressure: 35 + Math.random() * 5, // Lower pressure due to leak
        temperature: 68 + Math.random() * 8
      };

      // Check if leak has been active for more than 30 minutes
      if (this.leakStartTime && (now.getTime() - this.leakStartTime.getTime()) > 30 * 60 * 1000) {
        this.createLeakAlert(now);
      }
    } else {
      reading = this.generateNormalReading(now);
    }

    this.readings.push(reading);
    
    // Keep only last 7 days of data
    const cutoffTime = now.getTime() - (7 * 24 * 60 * 60 * 1000);
    this.readings = this.readings.filter(r => r.timestamp.getTime() > cutoffTime);

    return reading;
  }

  public simulateLeak(): void {
    this.isLeakActive = true;
    this.leakStartTime = new Date();
  }

  public stopLeak(): void {
    this.isLeakActive = false;
    this.leakStartTime = null;
  }

  private createLeakAlert(timestamp: Date): void {
    const alert: Alert = {
      id: `alert-${timestamp.getTime()}`,
      type: 'continuous_flow',
      severity: 'high',
      title: 'Potential Leak Detected',
      message: `Continuous water flow detected for over 30 minutes. Current flow rate: ${this.readings[this.readings.length - 1]?.flowRate.toFixed(1)} gal/min`,
      timestamp,
      acknowledged: false,
      resolved: false,
      householdId: this.household.id
    };

    this.alerts.push(alert);
  }

  public getRecentReadings(hours: number = 24): WaterUsageReading[] {
    const cutoffTime = new Date().getTime() - (hours * 60 * 60 * 1000);
    return this.readings.filter(r => r.timestamp.getTime() > cutoffTime);
  }

  public getAllReadings(): WaterUsageReading[] {
    return [...this.readings];
  }

  public getAlerts(): Alert[] {
    return [...this.alerts];
  }

  public acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  public resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  public getMunicipalData(): MunicipalData {
    const recentReadings = this.getRecentReadings(24);
    const totalUsageToday = recentReadings.reduce((sum, r) => sum + r.gallons, 0);
    
    return {
      totalHouseholds: 1547,
      activeAlerts: this.alerts.filter(a => !a.resolved).length,
      totalUsageToday: totalUsageToday * 1547, // Simulate community usage
      averageUsagePerHousehold: totalUsageToday,
      systemPressure: 48.5,
      maintenanceScheduled: 3
    };
  }
}