"use client";

import React, { useState, useEffect } from 'react';

import {
  BuildingOfficeIcon,
  AcademicCapIcon,
  CreditCardIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/hooks/useTranslation';
import { Database } from '@/types/supabase';
import { apiCache, createCacheKey, getCachedData } from '@/lib/apiCache';
import { SettingsPageSkeleton } from '@/components/skeletons/SettingsPageSkeleton';
import { PaymentFeeRate } from '@/types/payment-fee';

type School = Database['public']['Tables']['schools']['Row'];
type AcademicYear = Database['public']['Tables']['academic_years']['Row'];

interface SchoolSettingsFormData {
  name: string;
  address: string;
  contact_email: string;
  contact_phone: string;
  registration_number: string;
  currency: string;
  payment_provider: string;
  logo_url: string;
}

interface AcademicYearFormData {
  name: string;
  start_date: string;
  end_date: string;
}

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CDF', name: 'Congolese Franc', symbol: 'FC' },
  { code: 'XAF', name: 'Central African Franc', symbol: 'FCFA' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
];

const PAYMENT_PROVIDERS = [
  { id: 'mpesa', name: 'M-Pesa', description: 'Safaricom mobile money service' },
  { id: 'airtel_money', name: 'Airtel Money', description: 'Airtel mobile money service' },
  { id: 'orange_money', name: 'Orange Money', description: 'Orange mobile money service' },
  { id: 'mtn_momo', name: 'MTN Mobile Money', description: 'MTN mobile money service' },
  { id: 'bank_transfer', name: 'Bank Transfer', description: 'Direct bank transfer' },
  { id: 'cash', name: 'Cash', description: 'Cash payments' },
];

export function SchoolStaffSettingsView() {
  const { t } = useTranslation();

  // Initialize with cached data to avoid skeleton flash
  const [school, setSchool] = useState<School | null>(() => {
    const cached = getCachedData<{ school: School }>(createCacheKey('school:settings'));
    return cached?.school || null;
  });

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(() => {
    const cached = getCachedData<{ academicYears: AcademicYear[] }>(createCacheKey('school:settings'));
    return cached?.academicYears || [];
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingSchool, setEditingSchool] = useState(false);
  const [editingAcademicYear, setEditingAcademicYear] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Payment fee states
  const [feeRates, setFeeRates] = useState<PaymentFeeRate[]>([]);
  const [activeRate, setActiveRate] = useState<PaymentFeeRate | null>(null);
  const [pendingRates, setPendingRates] = useState<PaymentFeeRate[]>([]);
  const [loadingFees, setLoadingFees] = useState(false);
  
  const [schoolForm, setSchoolForm] = useState<SchoolSettingsFormData>({
    name: '',
    address: '',
    contact_email: '',
    contact_phone: '',
    registration_number: '',
    currency: 'USD',
    payment_provider: '',
    logo_url: '',
  });

  const [academicYearForm, setAcademicYearForm] = useState<AcademicYearFormData>({
    name: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    // Only load if we don't have data (no cache)
    if (!school) {
      loadSchoolData();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadFeeRates = async () => {
    try {
      setLoadingFees(true);
      const res = await fetch('/api/school/payment-fees');
      if (!res.ok) {
        throw new Error(`Failed to fetch fee rates: ${res.status}`);
      }
      const result = await res.json();
      if (result.success) {
        const rates = result.data || [];
        setFeeRates(rates);
        const active = rates.find((rate: PaymentFeeRate) => rate.status === 'active');
        setActiveRate(active || null);
        const pending = rates.filter((rate: PaymentFeeRate) =>
          rate.status === 'pending_school' || rate.status === 'pending_admin'
        );
        setPendingRates(pending);
      }
    } catch (error) {
      console.error('Error loading fee rates:', error);
    } finally {
      setLoadingFees(false);
    }
  };

  const loadSchoolData = async () => {
    const cacheKey = createCacheKey('school:settings');

    try {

      // No cache - fetch from API
      setLoading(true);
      const res = await fetch('/api/schools/settings');
      if (!res.ok) {
        throw new Error(`Failed to fetch school settings: ${res.status}`);
      }
      const text = await res.text();
      let schoolData;
      try {
        schoolData = JSON.parse(text);
      } catch {
        console.error('Failed to parse school settings response:', text);
        throw new Error('Invalid JSON response from server');
      }

      // Cache the result
      apiCache.set(cacheKey, schoolData);

      if (schoolData.school) {
        console.log('School logo URL:', schoolData.school.logo_url);
        setSchool(schoolData.school);
        setSchoolForm({
          name: schoolData.school.name || '',
          address: schoolData.school.address || '',
          contact_email: schoolData.school.contact_email || '',
          contact_phone: schoolData.school.contact_phone || '',
          registration_number: schoolData.school.registration_number || '',
          currency: schoolData.school.currency || 'USD',
          payment_provider: schoolData.school.payment_provider || '',
          logo_url: schoolData.school.logo_url || '',
        });
      }

      // Load academic years with caching
      const academicYearsData = await cachedApiCall(
        createCacheKey('academic-years'),
        async () => {
          const res = await fetch('/api/academic-years');
          if (!res.ok) {
            throw new Error(`Failed to fetch academic years: ${res.status}`);
          }
          const text = await res.text();
          try {
            return JSON.parse(text);
          } catch {
            console.error('Failed to parse academic years response:', text);
            throw new Error('Invalid JSON response from server');
          }
        }
      );

      if (academicYearsData.academic_years) {
        setAcademicYears(academicYearsData.academic_years);
      }

      // Load payment fee rates
      await loadFeeRates();

    } catch (error) {
      console.error('Error loading school data:', error);
      alert('Failed to load school settings. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolUpdate = async () => {
    if (!school) return;

    try {
      setSaving(true);
      
      const response = await fetch('/api/schools/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(schoolForm),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update school');
      }

      // Clear cache after successful update
      apiCache.clearPattern('school:settings');
      
      await loadSchoolData();
      setEditingSchool(false);
    } catch (error) {
      console.error('Error updating school:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAcademicYearCreate = async () => {
    if (!school) return;

    try {
      setSaving(true);
      
      const response = await fetch('/api/academic-years', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(academicYearForm),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create academic year');
      }

      // Clear cache after successful creation
      apiCache.clearPattern('academic-years');
      
      await loadSchoolData();
      setAcademicYearForm({ name: '', start_date: '', end_date: '' });
      setEditingAcademicYear(false);
    } catch (error) {
      console.error('Error creating academic year:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !school) return;

    try {
      setUploadingLogo(true);
      
      // Create FormData for API upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload via API route
      const response = await fetch('/api/school/receipt-logo-upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload logo');
      }

      if (result.success) {
        // Clear cache after successful logo upload
        apiCache.clearPattern('school:settings');
        
        setSchoolForm(prev => ({ ...prev, logo_url: result.data.logo_url }));
        await loadSchoolData();
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
    } finally {
      setUploadingLogo(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'suspended': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'pending': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      case 'suspended': return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default: return <ExclamationTriangleIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleApproveFeeRate = async (rateId: string) => {
    if (!confirm(t('Are you sure you want to approve this fee rate?'))) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/school/payment-fees/${rateId}/approve`, {
        method: 'POST',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to approve fee rate');
      }

      await loadFeeRates();
    } catch (error) {
      console.error('Error approving fee rate:', error);
      alert(t('Failed to approve fee rate. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  const handleRejectFeeRate = async (rateId: string) => {
    const reason = prompt(t('Please provide a reason for rejection (optional):'));
    if (reason === null) return; // User cancelled

    try {
      setSaving(true);
      const res = await fetch(`/api/school/payment-fees/${rateId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || undefined }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to reject fee rate');
      }

      await loadFeeRates();
    } catch (error) {
      console.error('Error rejecting fee rate:', error);
      alert(t('Failed to reject fee rate. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SettingsPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('School Settings')}</h1>
        <p className="text-gray-600">{t('Configure your school\'s preferences and settings')}</p>
      </div>

      {/* School Information Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-6 w-6 text-blue-500 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">{t('School Information')}</h3>
            </div>
            {!editingSchool && (
              <button
                onClick={() => setEditingSchool(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                {t('Edit')}
              </button>
            )}
          </div>

          {editingSchool ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('School Name')}</label>
                  <input
                    type="text"
                    value={schoolForm.name}
                    onChange={(e) => setSchoolForm(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('Registration Number')}</label>
                  <input
                    type="text"
                    value={schoolForm.registration_number}
                    onChange={(e) => setSchoolForm(prev => ({ ...prev, registration_number: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('Address')}</label>
                <textarea
                  value={schoolForm.address}
                  onChange={(e) => setSchoolForm(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('Contact Email')}</label>
                  <input
                    type="email"
                    value={schoolForm.contact_email}
                    onChange={(e) => setSchoolForm(prev => ({ ...prev, contact_email: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('Contact Phone')}</label>
                  <input
                    type="tel"
                    value={schoolForm.contact_phone}
                    onChange={(e) => setSchoolForm(prev => ({ ...prev, contact_phone: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('School Logo')}</label>
                <div className="mt-1 flex items-center space-x-4">
                  {schoolForm.logo_url && (
                    <img
                      src={schoolForm.logo_url}
                      alt="School Logo"
                      className="h-16 w-16 object-cover rounded-lg border border-gray-300"
                    />
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {uploadingLogo && (
                      <p className="mt-1 text-sm text-gray-500">{t('Uploading...')}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setEditingSchool(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {t('Cancel')}
                </button>
                <button
                  onClick={handleSchoolUpdate}
                  disabled={saving}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? t('Saving...') : t('Save Changes')}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('School Name')}</span>
                  <span className="text-sm font-medium text-gray-900">{school?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('Registration Number')}</span>
                  <span className="text-sm font-medium text-gray-900">{school?.registration_number || t('Not set')}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('Address')}</span>
                <span className="text-sm font-medium text-gray-900">{school?.address || t('Not set')}</span>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('Contact Email')}</span>
                  <span className="text-sm font-medium text-gray-900">{school?.contact_email || t('Not set')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('Contact Phone')}</span>
                  <span className="text-sm font-medium text-gray-900">{school?.contact_phone || t('Not set')}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('Status')}</span>
                <div className="flex items-center">
                  {getStatusIcon(school?.status || 'pending')}
                  <span className={`ml-2 text-sm font-medium ${getStatusColor(school?.status || 'pending')}`}>
                    {t(school?.status || 'pending')}
                  </span>
                </div>
              </div>

              {school?.logo_url && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('Logo')}</span>
                  <img
                    src={school.logo_url}
                    alt="School Logo"
                    className="h-12 w-12 object-cover rounded-lg border border-gray-300"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Payment Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-4">
            <CreditCardIcon className="h-6 w-6 text-purple-500 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">{t('Payment Settings')}</h3>
          </div>

          {editingSchool ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('Currency')}</label>
                  <select
                    value={schoolForm.currency}
                    onChange={(e) => setSchoolForm(prev => ({ ...prev, currency: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    {CURRENCIES.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.name} ({currency.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('Payment Provider')}</label>
                  <select
                    value={schoolForm.payment_provider}
                    onChange={(e) => setSchoolForm(prev => ({ ...prev, payment_provider: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">{t('Select Payment Provider')}</option>
                    {PAYMENT_PROVIDERS.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('Currency')}</span>
                <span className="text-sm font-medium text-gray-900">
                  {CURRENCIES.find(c => c.code === school?.currency)?.symbol} {school?.currency}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('Payment Provider')}</span>
                <span className="text-sm font-medium text-gray-900">
                  {school?.payment_provider ? 
                    PAYMENT_PROVIDERS.find(p => p.id === school.payment_provider)?.name : 
                    t('Not set')
                  }
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Platform Payment Fees */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-4">
            <BanknotesIcon className="h-6 w-6 text-orange-500 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">{t('Platform Payment Fees')}</h3>
          </div>

          {loadingFees ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">{t('Loading fee rates...')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Current Active Rate */}
              {activeRate ? (
                <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{t('Current Active Rate')}</h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {t('Active')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{activeRate.fee_percentage}%</p>
                      <p className="text-sm text-gray-600">
                        {t('Effective since')}: {new Date(activeRate.activated_at || activeRate.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <p className="text-sm text-gray-600">
                    {t('No active fee rate. Using default platform rate of 2.5%')}
                  </p>
                </div>
              )}

              {/* Pending Approvals */}
              {pendingRates.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">{t('Pending Approvals')}</h4>
                  <div className="space-y-3">
                    {pendingRates.map((rate) => (
                      <div key={rate.id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg font-bold text-gray-900">{rate.fee_percentage}%</span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                rate.status === 'pending_school' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {rate.status === 'pending_school' ? t('Awaiting School Approval') : t('Awaiting Admin Approval')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              {t('Proposed by')}: {rate.proposed_by_role === 'admin' ? t('Platform Admin') : t('School')}
                            </p>
                            <p className="text-sm text-gray-600">
                              {t('Proposed on')}: {new Date(rate.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                            {rate.notes && (
                              <p className="text-sm text-gray-600 mt-2 italic">{t('Note')}: {rate.notes}</p>
                            )}
                          </div>

                          {rate.status === 'pending_school' && (
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => handleApproveFeeRate(rate.id)}
                                disabled={saving}
                                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                              >
                                {t('Approve')}
                              </button>
                              <button
                                onClick={() => handleRejectFeeRate(rate.id)}
                                disabled={saving}
                                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                              >
                                {t('Reject')}
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
                  <h4 className="text-sm font-medium text-gray-900 mb-3">{t('Fee Rate History')}</h4>
                  <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('Rate')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('Status')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('Proposed By')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('Date')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {feeRates.slice(0, 5).map((rate) => (
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
                              {rate.proposed_by_role === 'admin' ? t('Platform Admin') : t('School')}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                              {new Date(rate.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <p className="text-sm text-gray-700">
                  {t('Platform payment fees are charged on each transaction. Parents pay the base amount plus the fee. Schools receive the full amount and owe the platform the fee amount separately.')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Academic Year Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <AcademicCapIcon className="h-6 w-6 text-green-500 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">{t('Academic Years')}</h3>
            </div>
            <button
              onClick={() => setEditingAcademicYear(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              {t('Add Academic Year')}
            </button>
          </div>

          {editingAcademicYear ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('Academic Year Name')}</label>
                <input
                  type="text"
                  value={academicYearForm.name}
                  onChange={(e) => setAcademicYearForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., 2024-2025"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('Start Date')}</label>
                  <input
                    type="date"
                    value={academicYearForm.start_date}
                    onChange={(e) => setAcademicYearForm(prev => ({ ...prev, start_date: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('End Date')}</label>
                  <input
                    type="date"
                    value={academicYearForm.end_date}
                    onChange={(e) => setAcademicYearForm(prev => ({ ...prev, end_date: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setEditingAcademicYear(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {t('Cancel')}
                </button>
                <button
                  onClick={handleAcademicYearCreate}
                  disabled={saving || !academicYearForm.name || !academicYearForm.start_date || !academicYearForm.end_date}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? t('Creating...') : t('Create Academic Year')}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {academicYears.length > 0 ? (
                academicYears.map((year) => (
                  <div key={year.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{year.name}</h4>
                        <p className="text-sm text-gray-500">
                          {year.start_date && year.end_date ? (
                            `${new Date(year.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} - ${new Date(year.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`
                          ) : (
                            t('Date not set')
                          )}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {year.is_active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {t('Active')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {t('Inactive')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">{t('No Academic Years')}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {t('Get started by creating your first academic year.')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}