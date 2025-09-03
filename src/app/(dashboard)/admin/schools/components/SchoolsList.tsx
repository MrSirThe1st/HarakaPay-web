// src/app/(dashboard)/admin/schools/components/SchoolsList.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
  onRefresh?: () => void; // Make optional and only call it manually
  refreshTrigger?: number; // Add trigger for external refresh
}

export function SchoolsList({ onRefresh, refreshTrigger }: SchoolsListProps) {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchools = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/schools', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch schools');
      }

      const result = await response.json();
      console.log('Schools API response:', result);
      setSchools(result.schools || []);
    } catch (err) {
      console.error('Schools fetch error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  // Refresh when external trigger changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchSchools();
    }
  }, [refreshTrigger, fetchSchools]);

  // REMOVED the problematic useEffect that was calling onRefresh automatically
  // Now onRefresh is only called manually when needed

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

  // Manual refresh function for external use
  const handleRefresh = useCallback(() => {
    fetchSchools();
    onRefresh?.(); // Call the parent callback if provided
  }, [fetchSchools, onRefresh]);

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
          onClick={handleRefresh}
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
          Click "Add School" to register your first school.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">
          Schools ({schools.length})
        </h2>
        <button
          onClick={handleRefresh}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {schools.map((school) => (
          <div key={school.id} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />
                  <h3 className="ml-3 text-lg font-medium text-gray-900">
                    {school.name}
                  </h3>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(school.status, school.verification_status || '')}
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(school.status, school.verification_status || '')}`}>
                    {getStatusText(school.status, school.verification_status || '')}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 space-y-3">
                {school.address && (
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    {school.address}
                  </div>
                )}
                
                {school.contact_email && (
                  <div className="flex items-center text-sm text-gray-500">
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    {school.contact_email}
                  </div>
                )}
                
                {school.contact_phone && (
                  <div className="flex items-center text-sm text-gray-500">
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    {school.contact_phone}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Created: {new Date(school.created_at).toLocaleDateString()}</span>
                  {school.registration_number && (
                    <span>Reg: {school.registration_number}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}