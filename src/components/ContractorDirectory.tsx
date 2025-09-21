import React, { useState, useMemo } from 'react';
import { Search, Filter, MapPin, Star } from 'lucide-react';
import { Contractor } from '../types';
import { ContractorCard } from './ContractorCard';

interface ContractorDirectoryProps {
  contractors: Contractor[];
  onContactContractor: (contractor: Contractor) => void;
}

export const ContractorDirectory: React.FC<ContractorDirectoryProps> = ({
  contractors,
  onContactContractor
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'response' | 'experience'>('rating');

  const specialties = useMemo(() => {
    const allSpecialties = contractors.flatMap(c => c.specialty);
    return Array.from(new Set(allSpecialties));
  }, [contractors]);

  const filteredContractors = useMemo(() => {
    let filtered = contractors.filter(contractor => {
      const matchesSearch = 
        contractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contractor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contractor.specialty.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSpecialty = !selectedSpecialty || contractor.specialty.includes(selectedSpecialty);
      const matchesEmergency = !emergencyOnly || contractor.emergencyService;
      
      return matchesSearch && matchesSpecialty && matchesEmergency;
    });

    // Sort contractors
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'response':
          // Simple response time sorting (would need more complex logic in real app)
          return a.responseTime.localeCompare(b.responseTime);
        case 'experience':
          return b.yearsExperience - a.yearsExperience;
        default:
          return 0;
      }
    });

    return filtered;
  }, [contractors, searchTerm, selectedSpecialty, emergencyOnly, sortBy]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Find Water System Contractors</h2>
        
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, company, or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All specialties</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rating' | 'response' | 'experience')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="rating">Sort by Rating</option>
              <option value="response">Sort by Response Time</option>
              <option value="experience">Sort by Experience</option>
            </select>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={emergencyOnly}
                onChange={(e) => setEmergencyOnly(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Emergency service only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Found {filteredContractors.length} contractor{filteredContractors.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Contractor Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {filteredContractors.map(contractor => (
          <ContractorCard
            key={contractor.id}
            contractor={contractor}
            onContact={onContactContractor}
          />
        ))}
      </div>

      {filteredContractors.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No contractors found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};