"use client";

import React, { useState } from 'react';
import { XMarkIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { PaymentFeeRateWithDetails } from '@/types/payment-fee';

interface SchoolApproveRejectModalProps {
  rate: PaymentFeeRateWithDetails;
  action: 'approve' | 'reject';
  onClose: () => void;
  onSuccess: () => void;
}

export function SchoolApproveRejectModal({ rate, action, onClose, onSuccess }: SchoolApproveRejectModalProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (action === 'reject' && !rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    setSubmitting(true);

    try {
      const endpoint = action === 'approve'
        ? `/api/school/payment-fees/${rate.id}/approve`
        : `/api/school/payment-fees/${rate.id}/reject`;

      const body = action === 'reject' ? { rejection_reason: rejectionReason } : undefined;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} fee rate`);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} fee rate`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black opacity-30" onClick={onClose}></div>

        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              {action === 'approve' ? (
                <>
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  Approve Fee Rate
                </>
              ) : (
                <>
                  <XCircleIcon className="h-6 w-6 text-red-600" />
                  Reject Fee Rate
                </>
              )}
            </h2>
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

          <div className="mb-4 p-4 bg-gray-50 rounded-md">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Fee Percentage:</span>
                <span className="font-medium">{rate.fee_percentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Proposed By:</span>
                <span className="font-medium">
                  {rate.proposed_by?.first_name} {rate.proposed_by?.last_name}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {action === 'reject' && (
              <div>
                <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason *
                </label>
                <textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Explain why you are rejecting this fee rate..."
                  required
                />
              </div>
            )}

            {action === 'approve' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-800">
                  After your approval, this rate will still require platform admin approval before becoming active.
                </p>
              </div>
            )}

            {action === 'reject' && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">
                  The platform admin will be notified of this rejection.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${
                  action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={submitting}
              >
                {submitting ? 'Processing...' : action === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
