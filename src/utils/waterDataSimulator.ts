import { WaterUsageReading, HouseholdProfile, Alert, MunicipalData } from '../types';

export class WaterDataSimulator {
  private readings: WaterUsageReading[] = [];
  private alerts: Alert[] = [];
  private serviceRequests: any[] = [];
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
    const litres = Math.max(0, baseUsage * (1 + variation) * 3.78541); // Convert gallons to litres
    
    return {
      id: `reading-${timestamp.getTime()}`,
      timestamp,
      litres: Math.round(litres * 100) / 100,
      flowRate: Math.round((litres * 12) * 100) / 100, // Convert to flow rate
      pressure: 310 + Math.random() * 69, // 310-379 kPa (45-55 PSI)
      temperature: 18 + Math.random() * 8 // 18-26°C (65-80°F)
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
        litres: (15 + Math.random() * 5) * 3.78541, // High continuous usage in litres
        flowRate: (180 + Math.random() * 60) * 3.78541, // High flow rate in litres/min
        pressure: 241 + Math.random() * 34, // Lower pressure due to leak (35-40 PSI in kPa)
        temperature: 20 + Math.random() * 4 // 20-24°C
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
      message: `Continuous water flow detected for over 30 minutes. Current flow rate: ${this.readings[this.readings.length - 1]?.flowRate.toFixed(1)} L/min`,
      timestamp,
      acknowledged: false,
      resolved: false,
      householdId: this.household.id,
      wardNumber: this.household.ward
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
    const totalUsageToday = recentReadings.reduce((sum, r) => sum + r.litres, 0);
    
    return {
      municipalityName: 'City of Cape Town',
      municipalityType: 'metro',
      totalHouseholds: 1547,
      totalWards: 10,
      activeAlerts: this.alerts.filter(a => !a.resolved).length,
      totalUsageToday: totalUsageToday * 1547, // Simulate community usage
      averageUsagePerHousehold: totalUsageToday,
      systemPressure: 334, // kPa (48.5 PSI)
      maintenanceScheduled: 3,
      serviceRequests: {
        open: 23,
        inProgress: 15,
        completed: 142
      },
      revenue: {
        ratesCollected: 45600000, // R45.6M
        waterRevenue: 23400000,   // R23.4M
        electricityRevenue: 67800000 // R67.8M
      }
    };
  }

  public generateServiceRequests(): any[] {
    const categories = ['water', 'electricity', 'refuse', 'roads', 'housing'];
    const priorities = ['low', 'medium', 'high', 'emergency'];
    const statuses = ['open', 'assigned', 'in_progress', 'completed'];
    
    const requests = [];
    for (let i = 0; i < 50; i++) {
      const createdDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      requests.push({
        id: `req-${Date.now()}-${i}`,
        householdId: `household-${Math.floor(Math.random() * 100)}`,
        municipalityId: 'cape-town',
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        description: this.generateRequestDescription(),
        location: {
          address: this.generateAddress(),
          ward: Math.floor(Math.random() * 10) + 1
        },
        createdAt: createdDate,
        updatedAt: new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
        estimatedCost: Math.floor(Math.random() * 50000) + 1000
      });
    }
    
    return requests;
  }

  private generateRequestDescription(): string {
    const descriptions = [
      'Water leak reported in front garden area',
      'Street light not working for past week',
      'Refuse not collected on scheduled day',
      'Pothole causing damage to vehicles',
      'Blocked storm water drain causing flooding',
      'Electricity supply intermittent',
      'Water pressure very low',
      'Sewage overflow in street',
      'Damaged pavement needs repair',
      'Tree fallen across road after storm'
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  private generateAddress(): string {
    const streets = [
      'Main Road', 'Church Street', 'Victoria Road', 'Long Street',
      'Kloof Street', 'Strand Street', 'Adderley Street', 'Loop Street',
      'Bree Street', 'Wale Street'
    ];
    
    const suburbs = [
      'Observatory', 'Woodstock', 'Salt River', 'Mowbray',
      'Rondebosch', 'Claremont', 'Wynberg', 'Plumstead',
      'Goodwood', 'Parow'
    ];
    
    const streetNum = Math.floor(Math.random() * 999) + 1;
    const street = streets[Math.floor(Math.random() * streets.length)];
    const suburb = suburbs[Math.floor(Math.random() * suburbs.length)];
    
    return `${streetNum} ${street}, ${suburb}`;
  }
}