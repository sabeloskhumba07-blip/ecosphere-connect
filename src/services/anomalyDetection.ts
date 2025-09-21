import { WaterUsageReading, Alert, HouseholdProfile } from '../types';

export class AnomalyDetectionService {
  private continuousFlowThreshold = 30; // minutes
  private spikeThresholdMultiplier = 3.0; // 300% of normal
  private gradualIncreaseThreshold = 0.5; // 50% increase over time

  detectAnomalies(
    readings: WaterUsageReading[], 
    household: HouseholdProfile
  ): Alert[] {
    const alerts: Alert[] = [];
    
    if (readings.length < 2) return alerts;

    // Check for continuous flow
    const continuousFlowAlert = this.detectContinuousFlow(readings, household);
    if (continuousFlowAlert) alerts.push(continuousFlowAlert);

    // Check for usage spikes
    const spikeAlert = this.detectUsageSpike(readings, household);
    if (spikeAlert) alerts.push(spikeAlert);

    // Check for gradual increases
    const gradualAlert = this.detectGradualIncrease(readings, household);
    if (gradualAlert) alerts.push(gradualAlert);

    // Check for pressure anomalies
    const pressureAlert = this.detectPressureAnomaly(readings, household);
    if (pressureAlert) alerts.push(pressureAlert);

    return alerts;
  }

  private detectContinuousFlow(
    readings: WaterUsageReading[], 
    household: HouseholdProfile
  ): Alert | null {
    const recentReadings = readings.slice(-6); // Last 30 minutes (5-min intervals)
    
    if (recentReadings.length < 6) return null;

    const averageFlow = recentReadings.reduce((sum, r) => sum + r.flowRate, 0) / recentReadings.length;
    const minFlowForContinuous = 5; // gallons per minute

    // Check if flow has been consistently above threshold
    const isContinuous = recentReadings.every(r => r.flowRate > minFlowForContinuous);

    if (isContinuous && averageFlow > minFlowForContinuous) {
      return {
        id: `continuous-flow-${Date.now()}`,
        type: 'continuous_flow',
        severity: 'high',
        title: 'Continuous Water Flow Detected',
        message: `Water has been flowing continuously for ${this.continuousFlowThreshold} minutes. Average flow rate: ${averageFlow.toFixed(1)} gal/min`,
        timestamp: new Date(),
        acknowledged: false,
        resolved: false,
        householdId: household.id
      };
    }

    return null;
  }

  private detectUsageSpike(
    readings: WaterUsageReading[], 
    household: HouseholdProfile
  ): Alert | null {
    if (readings.length < 20) return null; // Need baseline data

    const recentReading = readings[readings.length - 1];
    const baselineReadings = readings.slice(-20, -1);
    const averageBaseline = baselineReadings.reduce((sum, r) => sum + r.flowRate, 0) / baselineReadings.length;

    const spikeThreshold = averageBaseline * this.spikeThresholdMultiplier;

    if (recentReading.flowRate > spikeThreshold && recentReading.flowRate > 50) {
      return {
        id: `usage-spike-${Date.now()}`,
        type: 'usage_spike',
        severity: recentReading.flowRate > 100 ? 'critical' : 'high',
        title: 'Unusual Water Usage Spike',
        message: `Current usage (${recentReading.flowRate.toFixed(1)} gal/min) is ${(recentReading.flowRate / averageBaseline).toFixed(1)}x higher than normal`,
        timestamp: new Date(),
        acknowledged: false,
        resolved: false,
        householdId: household.id
      };
    }

    return null;
  }

  private detectGradualIncrease(
    readings: WaterUsageReading[], 
    household: HouseholdProfile
  ): Alert | null {
    if (readings.length < 48) return null; // Need 4 hours of data

    const recentAverage = readings.slice(-12).reduce((sum, r) => sum + r.flowRate, 0) / 12; // Last hour
    const previousAverage = readings.slice(-48, -36).reduce((sum, r) => sum + r.flowRate, 0) / 12; // 3-4 hours ago

    const increaseRatio = recentAverage / previousAverage;

    if (increaseRatio > (1 + this.gradualIncreaseThreshold) && recentAverage > 10) {
      return {
        id: `gradual-increase-${Date.now()}`,
        type: 'usage_spike',
        severity: 'medium',
        title: 'Gradual Usage Increase Detected',
        message: `Water usage has gradually increased by ${((increaseRatio - 1) * 100).toFixed(0)}% over the past few hours`,
        timestamp: new Date(),
        acknowledged: false,
        resolved: false,
        householdId: household.id
      };
    }

    return null;
  }

  private detectPressureAnomaly(
    readings: WaterUsageReading[], 
    household: HouseholdProfile
  ): Alert | null {
    if (readings.length < 10) return null;

    const recentReadings = readings.slice(-10);
    const averagePressure = recentReadings.reduce((sum, r) => sum + r.pressure, 0) / recentReadings.length;

    // Low pressure threshold (normal is 40-60 PSI)
    if (averagePressure < 25) {
      return {
        id: `low-pressure-${Date.now()}`,
        type: 'low_pressure',
        severity: 'medium',
        title: 'Low Water Pressure Detected',
        message: `Water pressure has dropped to ${averagePressure.toFixed(1)} PSI. This may indicate a leak or system issue.`,
        timestamp: new Date(),
        acknowledged: false,
        resolved: false,
        householdId: household.id
      };
    }

    return null;
  }

  calculateWaterWaste(readings: WaterUsageReading[], household: HouseholdProfile): number {
    const recentReadings = readings.slice(-288); // Last 24 hours
    const totalUsage = recentReadings.reduce((sum, r) => sum + r.gallons, 0);
    
    return Math.max(0, totalUsage - household.averageDailyUsage);
  }

  estimateLeakCost(wasteInGallons: number, costPerGallon: number = 0.004): number {
    return wasteInGallons * costPerGallon;
  }
}

export const anomalyDetection = new AnomalyDetectionService();