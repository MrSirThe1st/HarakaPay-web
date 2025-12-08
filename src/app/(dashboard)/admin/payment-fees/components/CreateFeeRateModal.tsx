"use client";

import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CreateFeeRateModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface School {
  id: string;
  name: string;
}

export function CreateFeeRateModal({ onClose, onSuccess }: CreateFeeRateModalProps) {
  const [schools, setSchools] = useState<School[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [feePercentage, setFeePercentage] = useState('2.5');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/schools', {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch schools');

      const data = await response.json();
      setSchools(data.schools || []);
    } catch (err) {
      console.error('Error fetching schools:', err);
      setError('Failed to load schools');
    } finally {
      setLoadingSchools(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedSchoolId) {
      setError('Please select a school');
      return;
    }

    const percentage = parseFloat(feePercentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      setError('Fee percentage must be between 0 and 100');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/payment-fees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          school_id: selectedSchoolId,
          fee_percentage: percentage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create fee rate');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create fee rate');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black opacity-30" onClick={onClose}></div>

        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Propose New Fee Rate</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">Fee rate proposal created successfully! Awaiting school approval.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-1">
                School *
              </label>
              {loadingSchools ? (
                <div className="text-sm text-gray-500">Loading schools...</div>
              ) : (
                <select
                  id="school"
                  value={selectedSchoolId}
                  onChange={(e) => setSelectedSchoolId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a school</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label htmlFor="feePercentage" className="block text-sm font-medium text-gray-700 mb-1">
                Fee Percentage (%) *
              </label>
              <input
                type="number"
                id="feePercentage"
                value={feePercentage}
                onChange={(e) => setFeePercentage(e.target.value)}
                min="0"
                max="100"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Platform service fee added to each transaction
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                This proposal will require school approval before taking effect.
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={submitting || success}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting || success}
              >
                {success ? 'Created!' : submitting ? 'Creating...' : 'Propose Fee Rate'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
