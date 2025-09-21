import React, { useState, useEffect, useCallback } from 'react';
import { Dashboard } from './components/Dashboard';
import { WaterDataSimulator } from './utils/waterDataSimulator';
import { anomalyDetection } from './services/anomalyDetection';
import { pwaService } from './services/pwaService';
import { storageService } from './services/storageService';
import { HouseholdProfile, Alert, Contractor, WaterUsageReading } from './types';

// Sample data
const sampleHousehold: HouseholdProfile = {
  id: 'household-1',
  address: '123 Maple Street, Springfield',
  meterId: 'WM-2024-001',
  occupants: 4,
  averageDailyUsage: 300,
  baselineUsage: 2.5, // gallons per 5-min interval
  alertPreferences: {
    enablePushNotifications: true,
    enableEmailAlerts: true,
    leakThreshold: 200, // 200% increase
    continuousFlowMinutes: 30
  }
};

const sampleContractors: Contractor[] = [
  {
    id: '1',
    name: 'Mike Rodriguez',
    company: 'AquaFix Pro',
    specialty: ['Leak Detection', 'Pipe Repair', 'Emergency Service'],
    rating: 4.9,
    reviewCount: 127,
    responseTime: 'Within 2 hours',
    serviceArea: ['Springfield', 'Riverside', 'Oak Valley'],
    phone: '(555) 123-4567',
    email: 'mike@aquafixpro.com',
    available24h: true,
    emergencyService: true,
    certifications: ['Licensed Plumber', 'Leak Detection Specialist'],
    yearsExperience: 12
  },
  {
    id: '2',
    name: 'Sarah Chen',
    company: 'WaterWorks Solutions',
    specialty: ['System Installation', 'Pressure Regulation', 'Smart Meters'],
    rating: 4.8,
    reviewCount: 89,
    responseTime: 'Same day',
    serviceArea: ['Springfield', 'Meadowbrook'],
    phone: '(555) 987-6543',
    email: 'sarah@waterworkssolutions.com',
    available24h: false,
    emergencyService: true,
    certifications: ['Master Plumber', 'Smart Systems Certified'],
    yearsExperience: 8
  },
  {
    id: '3',
    name: 'Tom Anderson',
    company: 'Rapid Response Plumbing',
    specialty: ['Emergency Repairs', 'Burst Pipes', 'Water Damage'],
    rating: 4.7,
    reviewCount: 156,
    responseTime: 'Within 1 hour',
    serviceArea: ['Springfield', 'Oak Valley', 'Pine Hills'],
    phone: '(555) 456-7890',
    email: 'tom@rapidresponseplumbing.com',
    available24h: true,
    emergencyService: true,
    certifications: ['Emergency Response Certified', 'Water Damage Specialist'],
    yearsExperience: 15
  },
  {
    id: '4',
    name: 'Lisa Park',
    company: 'EcoFlow Systems',
    specialty: ['Water Conservation', 'Smart Monitoring', 'System Optimization'],
    rating: 4.9,
    reviewCount: 73,
    responseTime: 'Within 4 hours',
    serviceArea: ['Springfield', 'Riverside'],
    phone: '(555) 234-5678',
    email: 'lisa@ecoflowsystems.com',
    available24h: false,
    emergencyService: false,
    certifications: ['Water Efficiency Expert', 'Smart Home Integration'],
    yearsExperience: 6
  }
];

function App() {
  const [simulator] = useState(() => new WaterDataSimulator(sampleHousehold));
  const [readings, setReadings] = useState<WaterUsageReading[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLeakActive, setIsLeakActive] = useState(false);

  // Initialize app data
  useEffect(() => {
    const initializeData = async () => {
      // Load initial readings
      const initialReadings = simulator.getAllReadings();
      setReadings(initialReadings);
      
      // Save to storage
      try {
        for (const reading of initialReadings) {
          await storageService.store('readings', reading);
        }
        await storageService.store('households', sampleHousehold);
        for (const contractor of sampleContractors) {
          await storageService.store('contractors', contractor);
        }
      } catch (error) {
        console.warn('Storage error, using localStorage fallback:', error);
        storageService.setLocal('readings', initialReadings);
        storageService.setLocal('household', sampleHousehold);
        storageService.setLocal('contractors', sampleContractors);
      }
    };

    initializeData();
  }, [simulator]);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newReading = simulator.generateRealtimeReading();
      setReadings(prev => [...prev, newReading]);
      
      // Detect anomalies
      const newAlerts = anomalyDetection.detectAnomalies([...readings, newReading], sampleHousehold);
      if (newAlerts.length > 0) {
        setAlerts(prev => [...prev, ...newAlerts]);
        
        // Trigger push notification for critical alerts
        newAlerts.forEach(alert => {
          if (alert.severity === 'high' || alert.severity === 'critical') {
            pwaService.triggerLeakAlert();
          }
        });
      }
      
      // Store reading
      try {
        storageService.store('readings', newReading);
      } catch (error) {
        console.warn('Storage error:', error);
      }
    }, 5000); // Update every 5 seconds for demo

    return () => clearInterval(interval);
  }, [simulator, readings]);

  const handleSimulateLeak = useCallback(() => {
    simulator.simulateLeak();
    setIsLeakActive(true);
  }, [simulator]);

  const handleStopLeak = useCallback(() => {
    simulator.stopLeak();
    setIsLeakActive(false);
  }, [simulator]);

  const handleAcknowledgeAlert = useCallback((alertId: string) => {
    simulator.acknowledgeAlert(alertId);
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  }, [simulator]);

  const handleResolveAlert = useCallback((alertId: string) => {
    simulator.resolveAlert(alertId);
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  }, [simulator]);

  const handleContactContractor = useCallback((contractor: Contractor) => {
    // In a real app, this would open a contact form or initiate communication
    const subject = encodeURIComponent('Water System Service Request - Ecosphere Connect');
    const body = encodeURIComponent(
      `Hello ${contractor.name},\n\nI found your contact through Ecosphere Connect and would like to request service for my water system at ${sampleHousehold.address}.\n\nPlease contact me at your earliest convenience.\n\nThank you!`
    );
    
    window.open(`mailto:${contractor.email}?subject=${subject}&body=${body}`, '_blank');
  }, []);

  const municipalData = simulator.getMunicipalData();

  return (
    <Dashboard
      readings={readings}
      alerts={alerts}
      contractors={sampleContractors}
      municipalData={municipalData}
      onAcknowledgeAlert={handleAcknowledgeAlert}
      onResolveAlert={handleResolveAlert}
      onContactContractor={handleContactContractor}
      onSimulateLeak={handleSimulateLeak}
      onStopLeak={handleStopLeak}
      isLeakActive={isLeakActive}
    />
  );
}

export default App;