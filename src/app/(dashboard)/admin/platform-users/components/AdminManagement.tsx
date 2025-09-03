// src/app/(dashboard)/admin/platform-users/components/AdminManagement.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  UsersIcon, 
  EllipsisVerticalIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  KeyIcon,
  UserMinusIcon
} from '@heroicons/react/24/outline';

interface Admin {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  role: string;
  admin_type: string;
  phone: string | null;
  is_active: boolean;
  email: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState<Admin | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null);
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch admins');
      }

      const result = await response.json();
      setAdmins(result.admins || []);
    } catch (err) {
      console.error('Admins fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId) {
        const target = event.target as Element;
        if (!target.closest('.menu-container')) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const toggleMenu = useCallback((adminId: string) => {
    setOpenMenuId(openMenuId === adminId ? null : adminId);
  }, [openMenuId]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      case 'platform_admin':
        return 'bg-blue-100 text-blue-800';
      case 'support_admin':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircleIcon className="h-5 w-5 text-green-500" />
    ) : (
      <XCircleIcon className="h-5 w-5 text-red-500" />
    );
  };

  const handleResetPassword = useCallback(async (admin: Admin) => {
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
          adminId: admin.user_id,
          newPassword: newPassword
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reset password');
      }

      setResetPasswordSuccess(true);
      setTimeout(() => {
        setShowPasswordModal(null);
        setNewPassword('');
        setConfirmPassword('');
        setResetPasswordSuccess(false);
      }, 2000);
      
    } catch (err) {
      console.error('Password reset error:', err);
      setResetPasswordError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setResettingPassword(false);
    }
  }, [newPassword, confirmPassword]);

  const openPasswordModal = useCallback((admin: Admin) => {
    setShowPasswordModal(admin);
    setNewPassword('');
    setConfirmPassword('');
    setResetPasswordError(null);
    setResetPasswordSuccess(false);
    setOpenMenuId(null);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading admins...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <XCircleIcon className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Admins</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <button 
          onClick={fetchAdmins}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UsersIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Platform Admins</h2>
            <p className="text-gray-600">Manage platform administrators and their access</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {admins.length} admin{admins.length !== 1 ? 's' : ''}
        </div>
      </div>

      {admins.length === 0 ? (
        <div className="text-center py-12">
          <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Platform Admins</h3>
          <p className="mt-1 text-sm text-gray-500">
            There are currently no platform administrators registered.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {admins.map((admin) => (
            <div key={admin.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {admin.first_name.charAt(0)}{admin.last_name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3 min-w-0 flex-1">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {admin.first_name} {admin.last_name}
                      </h3>
                      <div className="flex items-center mt-1">
                        {getStatusIcon(admin.is_active)}
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(admin.role)}`}>
                          {admin.role.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu dots */}
                  <div className="relative ml-4 flex-shrink-0 menu-container">
                    <button
                      onClick={() => toggleMenu(admin.id)}
                      className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <EllipsisVerticalIcon className="h-5 w-5 text-gray-400" />
                    </button>
                    
                    {/* Dropdown menu */}
                    {openMenuId === admin.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1">
                          <button
                            onClick={() => openPasswordModal(admin)}
                            className="flex items-center w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                          >
                            <KeyIcon className="h-4 w-4 mr-3" />
                            Reset Password
                          </button>
                          <button
                            onClick={() => {
                              // TODO: Implement edit admin
                              setOpenMenuId(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <PencilIcon className="h-4 w-4 mr-3" />
                            Edit Admin
                          </button>
                          <button
                            onClick={() => {
                              // TODO: Implement deactivate admin
                              setOpenMenuId(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                          >
                            <UserMinusIcon className="h-4 w-4 mr-3" />
                            {admin.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 space-y-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    <span className="truncate">{admin.email}</span>
                  </div>
                  
                  {admin.phone && (
                    <div className="flex items-center text-sm text-gray-500">
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      {admin.phone}
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Created: {new Date(admin.created_at).toLocaleDateString()}
                  </div>

                  {admin.last_sign_in_at && (
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      Last login: {new Date(admin.last_sign_in_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reset Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-lg flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <KeyIcon className="h-5 w-5 text-blue-600" />
                  Reset Admin Password
                </h3>
                <button
                  onClick={() => setShowPasswordModal(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={resettingPassword}
                >
                  <XCircleIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="px-6 py-4 space-y-4">
              {resetPasswordSuccess ? (
                <div className="text-center py-4">
                  <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <h4 className="text-lg font-medium text-green-900 mb-2">Password Reset Successfully!</h4>
                  <p className="text-sm text-green-700">
                    The admin password has been updated.
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Reset password for: {showPasswordModal.first_name} {showPasswordModal.last_name}
                    </h4>
                    <p className="text-sm text-blue-800">
                      Email: {showPasswordModal.email}
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
                      onClick={() => setShowPasswordModal(null)}
                      disabled={resettingPassword}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleResetPassword(showPasswordModal)}
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
    </div>
  );
}
