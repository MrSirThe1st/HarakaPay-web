// src/app/(dashboard)/admin/schools/components/SchoolsList.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { createCacheKey, getCachedData, apiCache } from '@/lib/apiCache';
import {
  BuildingOfficeIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CheckBadgeIcon,
  XMarkIcon,
  EllipsisVerticalIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { Database } from '@/types/supabase';
import { AdminCredentials } from '@/types/user';
import { PaymentFeeRate } from '@/types/payment-fee';

type School = Database['public']['Tables']['schools']['Row'];

interface SchoolsListProps {
  onRefresh?: () => void; // Make optional and only call it manually
  refreshTrigger?: number; // Add trigger for external refresh
}

export function SchoolsList({ onRefresh, refreshTrigger }: SchoolsListProps) {
  // Initialize with cached data to avoid skeleton flash
  const [schools, setSchools] = useState<School[]>(() => {
    const cached = getCachedData<{ schools: School[] }>(createCacheKey('admin:schools'));
    return cached?.schools || [];
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyingSchool, setVerifyingSchool] = useState<string | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState<{ school: School; action: 'verify' | 'reject' } | null>(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState<School | null>(null);
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials | null>(null);
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null);
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Payment fee states
  const [showFeeModal, setShowFeeModal] = useState<School | null>(null);
  const [feeRates, setFeeRates] = useState<PaymentFeeRate[]>([]);
  const [loadingFees, setLoadingFees] = useState(false);
  const [proposingFee, setProposingFee] = useState(false);
  const [newFeePercentage, setNewFeePercentage] = useState('');
  const [feeNotes, setFeeNotes] = useState('');

  const fetchSchools = useCallback(async (skipCache = false) => {
    const cacheKey = createCacheKey('admin:schools');

    try {
      setError(null);

      // Check cache synchronously first
      if (!skipCache) {
        const cached = getCachedData<{ schools: typeof schools }>(cacheKey);
        if (cached) {
          setSchools(cached.schools || []);
          return;
        }
      }

      // No cache - fetch from API
      setLoading(true);
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

      // Cache and set
      apiCache.set(cacheKey, result);
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Menu functions
  const toggleMenu = useCallback((schoolId: string) => {
    setOpenMenuId(openMenuId === schoolId ? null : schoolId);
  }, [openMenuId]);

  const closeMenu = useCallback(() => {
    setOpenMenuId(null);
  }, []);

  // Refresh when external trigger changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      apiCache.delete(createCacheKey('admin:schools'));
      fetchSchools(true);
    }
  }, [refreshTrigger, fetchSchools]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId) {
        const target = event.target as Element;
        if (!target.closest('.menu-container')) {
          closeMenu();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId, closeMenu]);


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

  // Verification functions
  const handleVerifySchool = useCallback(async (schoolId: string, verificationStatus: 'verified' | 'rejected') => {
    try {
      setVerifyingSchool(schoolId);
      
      const response = await fetch('/api/schools/verify', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          schoolId,
          verificationStatus
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify school');
      }

      const result = await response.json();
      console.log('Verification result:', result);
      
      // Refresh the schools list
      await fetchSchools();
      setShowVerifyModal(null);
      
    } catch (err) {
      console.error('Verification error:', err);
      setError(err instanceof Error ? err.message : 'Failed to verify school');
    } finally {
      setVerifyingSchool(null);
    }
  }, [fetchSchools]);

  const openVerifyModal = useCallback((school: School, action: 'verify' | 'reject') => {
    setShowVerifyModal({ school, action });
  }, []);

  const closeVerifyModal = useCallback(() => {
    setShowVerifyModal(null);
  }, []);

  const fetchAdminCredentials = useCallback(async (schoolId: string) => {
    try {
      setLoadingCredentials(true);
      setError(null);
      
      const response = await fetch(`/api/admin/credentials?schoolId=${schoolId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch admin credentials');
      }

      const result = await response.json();
      setAdminCredentials(result.admin);
    } catch (err) {
      console.error('Credentials fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch credentials');
    } finally {
      setLoadingCredentials(false);
    }
  }, []);

  const openCredentialsModal = useCallback((school: School) => {
    setShowCredentialsModal(school);
    setAdminCredentials(null);
    fetchAdminCredentials(school.id);
    closeMenu();
  }, [fetchAdminCredentials, closeMenu]);

  const closeCredentialsModal = useCallback(() => {
    setShowCredentialsModal(null);
    setAdminCredentials(null);
    setShowResetPasswordModal(false);
    setNewPassword('');
    setConfirmPassword('');
    setResetPasswordError(null);
    setResetPasswordSuccess(false);
  }, []);

  const openResetPasswordModal = useCallback(() => {
    setShowResetPasswordModal(true);
    setNewPassword('');
    setConfirmPassword('');
    setResetPasswordError(null);
    setResetPasswordSuccess(false);
  }, []);

  const closeResetPasswordModal = useCallback(() => {
    setShowResetPasswordModal(false);
    setNewPassword('');
    setConfirmPassword('');
    setResetPasswordError(null);
    setResetPasswordSuccess(false);
  }, []);

  const handleResetPassword = useCallback(async () => {
    if (!adminCredentials) return;

    if (newPassword.length < 8) {
      setResetPasswordError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetPasswordError('Passwords do not match');
      return;
    }

    try {
      setResettingPassword(true);
      setResetPasswordError(null);

      const response = await fetch('/api/admin/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          adminId: adminCredentials.id,
          newPassword: newPassword
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reset password');
      }

      const result = await response.json();
      console.log('Password reset result:', result);

      setResetPasswordSuccess(true);
      setTimeout(() => {
        closeResetPasswordModal();
      }, 2000);

    } catch (err) {
      console.error('Password reset error:', err);
      setResetPasswordError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setResettingPassword(false);
    }
  }, [adminCredentials, newPassword, confirmPassword, closeResetPasswordModal]);

  // Payment fee functions
  const fetchFeeRates = useCallback(async (schoolId: string) => {
    try {
      setLoadingFees(true);
      const response = await fetch(`/api/admin/payment-fees?school_id=${schoolId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch fee rates');
      }

      const result = await response.json();
      setFeeRates(result.data || []);
    } catch (err) {
      console.error('Fee rates fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch fee rates');
    } finally {
      setLoadingFees(false);
    }
  }, []);

  const openFeeModal = useCallback((school: School) => {
    setShowFeeModal(school);
    setFeeRates([]);
    setNewFeePercentage('');
    setFeeNotes('');
    fetchFeeRates(school.id);
    closeMenu();
  }, [fetchFeeRates, closeMenu]);

  const closeFeeModal = useCallback(() => {
    setShowFeeModal(null);
    setFeeRates([]);
    setNewFeePercentage('');
    setFeeNotes('');
  }, []);

  const handleProposeFee = useCallback(async () => {
    if (!showFeeModal) return;

    const percentage = parseFloat(newFeePercentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      setError('Please enter a valid fee percentage between 0 and 100');
      return;
    }

    try {
      setProposingFee(true);
      setError(null);

      const response = await fetch('/api/admin/payment-fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          school_id: showFeeModal.id,
          fee_percentage: percentage,
          notes: feeNotes || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to propose fee rate');
      }

      setNewFeePercentage('');
      setFeeNotes('');
      await fetchFeeRates(showFeeModal.id);
    } catch (err) {
      console.error('Propose fee error:', err);
      setError(err instanceof Error ? err.message : 'Failed to propose fee rate');
    } finally {
      setProposingFee(false);
    }
  }, [showFeeModal, newFeePercentage, feeNotes, fetchFeeRates]);

  const handleApproveFee = useCallback(async (rateId: string) => {
    if (!showFeeModal || !confirm('Are you sure you want to finalize this fee rate?')) return;

    try {
      const response = await fetch(`/api/admin/payment-fees/${rateId}/approve`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve fee rate');
      }

      await fetchFeeRates(showFeeModal.id);
    } catch (err) {
      console.error('Approve fee error:', err);
      setError(err instanceof Error ? err.message : 'Failed to approve fee rate');
    }
  }, [showFeeModal, fetchFeeRates]);

  const handleRejectFee = useCallback(async (rateId: string) => {
    if (!showFeeModal) return;

    const reason = prompt('Please provide a reason for rejection (optional):');
    if (reason === null) return;

    try {
      const response = await fetch(`/api/admin/payment-fees/${rateId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: reason || undefined }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject fee rate');
      }

      await fetchFeeRates(showFeeModal.id);
    } catch (err) {
      console.error('Reject fee error:', err);
      setError(err instanceof Error ? err.message : 'Failed to reject fee rate');
    }
  }, [showFeeModal, fetchFeeRates]);

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
          Click &quot;Add School&quot; to register your first school.
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
          <div key={school.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center flex-1 min-w-0">
                  <BuildingOfficeIcon className="h-8 w-8 text-gray-400 flex-shrink-0" />
                  <div className="ml-3 min-w-0 flex-1">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {school.name}
                    </h3>
                    <div className="flex items-center mt-1">
                      {getStatusIcon(school.status, school.verification_status || '')}
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(school.status, school.verification_status || '')}`}>
                        {getStatusText(school.status, school.verification_status || '')}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Menu dots */}
                <div className="relative ml-4 flex-shrink-0 menu-container">
                  <button
                    onClick={() => toggleMenu(school.id)}
                    className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={verifyingSchool === school.id}
                  >
                    <EllipsisVerticalIcon className="h-5 w-5 text-gray-400" />
                  </button>
                  
                  {/* Dropdown menu */}
                  {openMenuId === school.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1">
                        {school.verification_status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                openVerifyModal(school, 'verify');
                                closeMenu();
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                            >
                              <CheckBadgeIcon className="h-4 w-4 mr-3" />
                              Verify School
                            </button>
                            <button
                              onClick={() => {
                                openVerifyModal(school, 'reject');
                                closeMenu();
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                            >
                              <XMarkIcon className="h-4 w-4 mr-3" />
                              Reject School
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openCredentialsModal(school)}
                          className="flex items-center w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                        >
                          <EnvelopeIcon className="h-4 w-4 mr-3" />
                          View Admin Credentials
                        </button>
                        {school.verification_status === 'verified' && (
                          <button
                            onClick={() => openFeeModal(school)}
                            className="flex items-center w-full px-4 py-2 text-sm text-orange-700 hover:bg-orange-50"
                          >
                            <BanknotesIcon className="h-4 w-4 mr-3" />
                            Manage Payment Fees
                          </button>
                        )}
                        <button
                          onClick={() => {
                            handleRefresh();
                            closeMenu();
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <ClockIcon className="h-4 w-4 mr-3" />
                          Refresh
                        </button>
                      </div>
                    </div>
                  )}
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

      {/* Verification Confirmation Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-lg flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  {showVerifyModal.action === 'verify' ? (
                    <>
                      <CheckBadgeIcon className="h-5 w-5 text-green-600" />
                      Verify School
                    </>
                  ) : (
                    <>
                      <XMarkIcon className="h-5 w-5 text-red-600" />
                      Reject School
                    </>
                  )}
                </h3>
                <button
                  onClick={closeVerifyModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={verifyingSchool === showVerifyModal.school.id}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="px-6 py-4 space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to {showVerifyModal.action} <strong>{showVerifyModal.school.name}</strong>?
              </p>
              
              {showVerifyModal.action === 'verify' ? (
                <p className="text-sm text-green-600">
                  This will mark the school as verified and allow them to access all platform features.
                </p>
              ) : (
                <p className="text-sm text-red-600">
                  This will mark the school as rejected and they will not be able to access the platform.
                </p>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  onClick={closeVerifyModal}
                  disabled={verifyingSchool === showVerifyModal.school.id}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleVerifySchool(
                    showVerifyModal.school.id, 
                    showVerifyModal.action === 'verify' ? 'verified' : 'rejected'
                  )}
                  disabled={verifyingSchool === showVerifyModal.school.id}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    showVerifyModal.action === 'verify'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {verifyingSchool === showVerifyModal.school.id ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      {showVerifyModal.action === 'verify' ? 'Verifying...' : 'Rejecting...'}
                    </>
                  ) : (
                    `${showVerifyModal.action === 'verify' ? 'Verify' : 'Reject'} School`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Credentials Modal */}
      {showCredentialsModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-lg flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <EnvelopeIcon className="h-5 w-5 text-blue-600" />
                  School Admin Credentials
                </h3>
                <button
                  onClick={closeCredentialsModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">School: {showCredentialsModal.name}</h4>
                
                {loadingCredentials ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-blue-600">Loading credentials...</span>
                  </div>
                ) : adminCredentials ? (
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-blue-900">Admin Name:</span>
                      <p className="text-blue-800">{adminCredentials.first_name} {adminCredentials.last_name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-900">Email:</span>
                      <p className="text-blue-800 font-mono">{adminCredentials.email}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-900">Role:</span>
                      <p className="text-blue-800">{adminCredentials.role}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-900">Admin Type:</span>
                      <p className="text-blue-800">{adminCredentials.admin_type}</p>
                    </div>
                    {adminCredentials.phone && (
                      <div>
                        <span className="font-medium text-blue-900">Phone:</span>
                        <p className="text-blue-800">{adminCredentials.phone}</p>
                      </div>
                    )}
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Password Setup:</strong> Use the &quot;Reset Password&quot; button below to set up the admin&apos;s login password. 
                        This is the primary way to create and manage admin passwords securely.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-red-600">Failed to load admin credentials</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={closeCredentialsModal}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                {adminCredentials && (
                  <button
                    onClick={openResetPasswordModal}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Reset Password
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-lg flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CheckBadgeIcon className="h-5 w-5 text-blue-600" />
                  Reset Admin Password
                </h3>
                <button
                  onClick={closeResetPasswordModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={resettingPassword}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="px-6 py-4 space-y-4">
              {resetPasswordSuccess ? (
                <div className="text-center py-4">
                  <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <h4 className="text-lg font-medium text-green-900 mb-2">Password Reset Successfully!</h4>
                  <p className="text-sm text-green-700">
                    The admin password has been updated. The admin can now log in with the new password.
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Reset password for: {adminCredentials?.first_name} {adminCredentials?.last_name}
                    </h4>
                    <p className="text-sm text-blue-800">
                      Email: {adminCredentials?.email}
                    </p>
                  </div>

                  {resetPasswordError && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <p className="text-sm text-red-600">{resetPasswordError}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter new password (min 8 characters)"
                        disabled={resettingPassword}
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Confirm new password"
                        disabled={resettingPassword}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={closeResetPasswordModal}
                      disabled={resettingPassword}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleResetPassword}
                      disabled={resettingPassword || !newPassword || !confirmPassword}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {resettingPassword ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Resetting...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Fees Management Modal */}
      {showFeeModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-lg flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl my-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BanknotesIcon className="h-5 w-5 text-orange-600" />
                  Payment Fees - {showFeeModal.name}
                </h3>
                <button
                  onClick={closeFeeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
              {loadingFees ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                  <span className="ml-2 text-gray-600">Loading fee rates...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Current Active Rate */}
                  {feeRates.find(r => r.status === 'active') ? (
                    <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                      <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        Current Active Rate
                      </h4>
                      {feeRates.filter(r => r.status === 'active').map(rate => (
                        <div key={rate.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-gray-900">{rate.fee_percentage}%</p>
                            <p className="text-sm text-gray-600">
                              Effective since: {new Date(rate.activated_at || rate.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <p className="text-sm text-gray-600">No active fee rate. Using default platform rate of 2.5%</p>
                    </div>
                  )}

                  {/* Propose New Rate */}
                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Propose New Fee Rate</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fee Percentage (0-100)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={newFeePercentage}
                          onChange={(e) => setNewFeePercentage(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="e.g., 2.5"
                          disabled={proposingFee}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes (optional)
                        </label>
                        <textarea
                          value={feeNotes}
                          onChange={(e) => setFeeNotes(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Add any notes about this fee rate..."
                          disabled={proposingFee}
                        />
                      </div>
                      <button
                        onClick={handleProposeFee}
                        disabled={proposingFee || !newFeePercentage}
                        className="w-full bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {proposingFee ? 'Proposing...' : 'Propose Fee Rate'}
                      </button>
                    </div>
                  </div>

                  {/* Pending Rates */}
                  {feeRates.filter(r => r.status === 'pending_school' || r.status === 'pending_admin').length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Pending Approvals</h4>
                      <div className="space-y-3">
                        {feeRates
                          .filter(r => r.status === 'pending_school' || r.status === 'pending_admin')
                          .map(rate => (
                            <div key={rate.id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg font-bold text-gray-900">{rate.fee_percentage}%</span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      rate.status === 'pending_school' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                      {rate.status === 'pending_school' ? 'Awaiting School' : 'Awaiting Admin Finalization'}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    Proposed on: {new Date(rate.created_at).toLocaleDateString()}
                                  </p>
                                  {rate.notes && (
                                    <p className="text-sm text-gray-600 mt-1 italic">Note: {rate.notes}</p>
                                  )}
                                </div>
                                {rate.status === 'pending_admin' && (
                                  <div className="flex gap-2 ml-4">
                                    <button
                                      onClick={() => handleApproveFee(rate.id)}
                                      className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                    >
                                      Finalize
                                    </button>
                                    <button
                                      onClick={() => handleRejectFee(rate.id)}
                                      className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Fee Rate History */}
                  {feeRates.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Fee Rate History</h4>
                      <div className="overflow-hidden border border-gray-200 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {feeRates.slice(0, 5).map(rate => (
                              <tr key={rate.id}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {rate.fee_percentage}%
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    rate.status === 'active' ? 'bg-green-100 text-green-800' :
                                    rate.status === 'pending_school' || rate.status === 'pending_admin' ? 'bg-yellow-100 text-yellow-800' :
                                    rate.status === 'rejected_by_school' || rate.status === 'rejected_by_admin' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {rate.status.replace(/_/g, ' ')}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                  {new Date(rate.created_at).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={closeFeeModal}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}