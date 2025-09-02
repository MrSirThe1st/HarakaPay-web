"use client";

import React, { useState, useEffect } from 'react';
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Database } from '@/types/supabase';

type School = Database['public']['Tables']['schools']['Row'];

interface SchoolsListProps {
  onRefresh: () => void;
}

export function SchoolsList({ onRefresh }: SchoolsListProps) {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, let's use a simple approach and modify the API to use cookies like other endpoints
      const response = await fetch('/api/schools', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch schools');
      }

      const result = await response.json();
      console.log('Schools API response:', result); // Debug log
      setSchools(result.schools || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  // Call onRefresh when schools are updated
  useEffect(() => {
    if (!loading && !error) {
      onRefresh();
    }
  }, [loading, error, onRefresh]);

  const getStatusIcon = (status: string, verificationStatus: string) => {
    if (status === 'approved' && verificationStatus === 'verified') {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    } else if (status === 'pending' || verificationStatus === 'pending') {
      return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    } else if (status === 'suspended' || verificationStatus === 'rejected') {
      return <XCircleIcon className="h-5 w-5 text-red-500" />;
    } else {
      return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
    }
  };

  const getStatusText = (status: string, verificationStatus: string) => {
    if (status === 'approved' && verificationStatus === 'verified') {
      return 'Active';
    } else if (status === 'pending' || verificationStatus === 'pending') {
      return 'Pending';
    } else if (status === 'suspended') {
      return 'Suspended';
    } else if (verificationStatus === 'rejected') {
      return 'Rejected';
    } else {
      return 'Unknown';
    }
  };

  const getStatusColor = (status: string, verificationStatus: string) => {
    if (status === 'approved' && verificationStatus === 'verified') {
      return 'bg-green-100 text-green-800';
    } else if (status === 'pending' || verificationStatus === 'pending') {
      return 'bg-yellow-100 text-yellow-800';
    } else if (status === 'suspended' || verificationStatus === 'rejected') {
      return 'bg-red-100 text-red-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading schools...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Schools</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <button 
          onClick={fetchSchools}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (schools.length === 0) {
    return (
      <div className="text-center py-12">
        <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No Schools Yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          There are currently no schools registered on the platform.
        </p>
        <p className="mt-2 text-sm text-gray-400">
          Click &quot;Add School&quot; to register your first school.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {schools.map((school) => (
        <div key={school.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <BuildingOfficeIcon className="h-6 w-6 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900">{school.name}</h3>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(school.status, school.verification_status)}`}>
                    {getStatusIcon(school.status, school.verification_status)}
                    {getStatusText(school.status, school.verification_status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {school.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 text-gray-400" />
                      <span className="truncate">{school.address}</span>
                    </div>
                  )}

                  {school.contact_phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <PhoneIcon className="h-4 w-4 text-gray-400" />
                      <span>{school.contact_phone}</span>
                    </div>
                  )}

                  {school.contact_email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                      <span className="truncate">{school.contact_email}</span>
                    </div>
                  )}

                  {school.registration_number && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Reg:</span>
                      <span>{school.registration_number}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">Created:</span>
                    <span>{new Date(school.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  View Details
                </button>
                <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
