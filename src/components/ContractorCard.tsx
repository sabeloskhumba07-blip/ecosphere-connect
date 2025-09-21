import React from 'react';
import { Star, Clock, Phone, Mail, Shield, Wrench } from 'lucide-react';
import { Contractor } from '../types';

interface ContractorCardProps {
  contractor: Contractor;
  onContact: (contractor: Contractor) => void;
}

export const ContractorCard: React.FC<ContractorCardProps> = ({
  contractor,
  onContact
}) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : i < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{contractor.name}</h3>
          <p className="text-gray-600">{contractor.company}</p>
          <div className="flex items-center mt-1">
            <div className="flex">{renderStars(contractor.rating)}</div>
            <span className="ml-2 text-sm text-gray-600">
              {contractor.rating.toFixed(1)} ({contractor.reviewCount} reviews)
            </span>
          </div>
        </div>
        {contractor.available24h && (
          <div className="flex items-center text-green-600 text-sm">
            <Clock className="h-4 w-4 mr-1" />
            24/7
          </div>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Wrench className="h-4 w-4 mr-2" />
          <span>{contractor.specialty.join(', ')}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-2" />
          <span>Response time: {contractor.responseTime}</span>
        </div>

        {contractor.emergencyService && (
          <div className="flex items-center text-sm text-red-600">
            <Shield className="h-4 w-4 mr-2" />
            <span>Emergency service available</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-600">
          {contractor.yearsExperience} years experience
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => window.open(`tel:${contractor.phone}`, '_self')}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm"
          >
            <Phone className="h-4 w-4 mr-1" />
            Call
          </button>
          <button
            onClick={() => onContact(contractor)}
            className="flex items-center px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors duration-200 text-sm"
          >
            <Mail className="h-4 w-4 mr-1" />
            Contact
          </button>
        </div>
      </div>
    </div>
  );
};