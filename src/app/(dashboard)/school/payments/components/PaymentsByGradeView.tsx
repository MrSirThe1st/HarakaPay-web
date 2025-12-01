"use client";

import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/hooks/useTranslation';
import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

interface PaidInstallment {
  installmentNumber: number | null;
  installmentLabel: string | null;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: string | null;
  paymentPlanType: string | null;
}

interface StudentPaymentData {
  id: string;
  first_name: string;
  last_name: string;
  student_id: string;
  grade_level: string;
  paymentStatus: 'not_paid' | 'partially_paid' | 'fully_paid' | 'no_fees_assigned';
  totalDue: number;
  paidAmount: number;
  remainingBalance: number;
  paymentPlanType: string | null;
  paidInstallments: PaidInstallment[];
  feeAssignments: Array<{
    id: string;
    totalDue: number;
    paidAmount: number;
    remainingBalance: number;
    status: string;
  }>;
}

interface PaymentsByGradeViewProps {
  isParentLoading?: boolean;
}

export function PaymentsByGradeView({ isParentLoading = false }: PaymentsByGradeViewProps) {
  const { t } = useTranslation();
  const [byGrade, setByGrade] = useState<Record<string, StudentPaymentData[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [expandedGrades, setExpandedGrades] = useState<Set<string>>(new Set());
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPaymentsByGrade();
  }, [selectedGrade]);

  const fetchPaymentsByGrade = async () => {
    try {
      setIsLoading(true);
      const searchParams = new URLSearchParams();
      if (selectedGrade !== 'all') {
        searchParams.set('grade_level', selectedGrade);
      }

      const response = await fetch(`/api/school/payments/by-grade?${searchParams.toString()}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch payments by grade');
      }

      setByGrade(result.data.byGrade || {});
      
      // Auto-expand all grades on first load
      if (Object.keys(result.data.byGrade || {}).length > 0 && expandedGrades.size === 0) {
        setExpandedGrades(new Set(Object.keys(result.data.byGrade || {})));
      }
    } catch (error) {
      console.error('Error fetching payments by grade:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGrade = (grade: string) => {
    setExpandedGrades(prev => {
      const newSet = new Set(prev);
      if (newSet.has(grade)) {
        newSet.delete(grade);
      } else {
        newSet.add(grade);
      }
      return newSet;
    });
  };

  const toggleStudent = (studentId: string) => {
    setExpandedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'fully_paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            Fully Paid
          </span>
        );
      case 'partially_paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-4 w-4 mr-1" />
            Partially Paid
          </span>
        );
      case 'not_paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="h-4 w-4 mr-1" />
            Not Paid
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            No Fees Assigned
          </span>
        );
    }
  };

  const getPaymentPlanBadge = (planType: string | null) => {
    if (!planType) return null;
    
    const colors: Record<string, string> = {
      'upfront': 'bg-blue-100 text-blue-800',
      'one_time': 'bg-blue-100 text-blue-800',
      'monthly': 'bg-purple-100 text-purple-800',
      'per-term': 'bg-indigo-100 text-indigo-800',
      'custom': 'bg-gray-100 text-gray-800'
    };

    const labels: Record<string, string> = {
      'upfront': 'One-time',
      'one_time': 'One-time',
      'monthly': 'Monthly',
      'per-term': 'Termly',
      'custom': 'Custom'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colors[planType] || colors.custom}`}>
        {labels[planType] || planType}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get unique grade levels for filter
  const gradeLevels = Array.from(new Set(Object.keys(byGrade))).sort();

  if (isLoading || isParentLoading) {
    return (
      <div className="space-y-4">
        {/* Filter Skeleton */}
        <div className="bg-white shadow rounded-lg p-4">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-10 w-64" />
        </div>

        {/* Grade Cards Skeleton */}
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Grade Filter */}
      <div className="bg-white shadow rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Grade Level
        </label>
        <select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="all">All Grades</option>
          {gradeLevels.map(grade => (
            <option key={grade} value={grade}>{grade}</option>
          ))}
        </select>
      </div>

      {/* Grade Groups */}
      {Object.keys(byGrade).length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">{t('No payment data available')}</p>
        </div>
      ) : (
        Object.entries(byGrade)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([grade, students]) => {
            const isExpanded = expandedGrades.has(grade);
            const paidCount = students.filter(s => s.paymentStatus === 'fully_paid').length;
            const partiallyPaidCount = students.filter(s => s.paymentStatus === 'partially_paid').length;
            const notPaidCount = students.filter(s => s.paymentStatus === 'not_paid').length;
            const totalDue = students.reduce((sum, s) => sum + s.totalDue, 0);
            const totalPaid = students.reduce((sum, s) => sum + s.paidAmount, 0);

            return (
              <div key={grade} className="bg-white shadow rounded-lg overflow-hidden">
                {/* Grade Header */}
                <button
                  onClick={() => toggleGrade(grade)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {isExpanded ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    )}
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Grade {grade}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {students.length} student{students.length !== 1 ? 's' : ''} • 
                        Paid: {paidCount} • Partial: {partiallyPaidCount} • Not Paid: {notPaidCount}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(totalPaid)} / {formatCurrency(totalDue)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {totalDue > 0 ? `${Math.round((totalPaid / totalDue) * 100)}% collected` : 'N/A'}
                    </div>
                  </div>
                </button>

                {/* Students List */}
                {isExpanded && (
                  <div className="border-t border-gray-200">
                    {students.map((student) => {
                      const isStudentExpanded = expandedStudents.has(student.id);
                      
                      return (
                        <div key={student.id} className="border-b border-gray-100 last:border-b-0">
                          {/* Student Row */}
                          <button
                            onClick={() => toggleStudent(student.id)}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              {isStudentExpanded ? (
                                <ChevronUpIcon className="h-4 w-4 text-gray-400" />
                              ) : (
                                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                              )}
                              <div className="flex-1 text-left">
                                <div className="flex items-center gap-3">
                                  <span className="font-medium text-gray-900">
                                    {student.first_name} {student.last_name}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    ({student.student_id})
                                  </span>
                                  {getStatusBadge(student.paymentStatus)}
                                  {getPaymentPlanBadge(student.paymentPlanType)}
                                </div>
                                <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                                  <span>
                                    <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
                                    {formatCurrency(student.paidAmount)} / {formatCurrency(student.totalDue)}
                                  </span>
                                  {student.remainingBalance > 0 && (
                                    <span className="text-red-600">
                                      Remaining: {formatCurrency(student.remainingBalance)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>

                          {/* Student Details */}
                          {isStudentExpanded && (
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                              {/* Payment Summary */}
                              <div className="mb-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Payment Summary</h4>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-500">Total Due:</span>
                                    <span className="ml-2 font-medium">{formatCurrency(student.totalDue)}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Amount Paid:</span>
                                    <span className="ml-2 font-medium text-green-600">{formatCurrency(student.paidAmount)}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Remaining:</span>
                                    <span className="ml-2 font-medium text-red-600">{formatCurrency(student.remainingBalance)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Paid Installments */}
                              {student.paidInstallments.length > 0 ? (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                    Paid Installments ({student.paidInstallments.length})
                                  </h4>
                                  <div className="space-y-2">
                                    {student.paidInstallments.map((installment, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center justify-between p-3 bg-white rounded border border-gray-200"
                                      >
                                        <div className="flex items-center gap-3">
                                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                          <div>
                                            <div className="font-medium text-gray-900">
                                              {installment.installmentLabel || `Installment ${installment.installmentNumber || idx + 1}`}
                                            </div>
                                            <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                              <CalendarIcon className="h-3 w-3" />
                                              {formatDate(installment.paymentDate)}
                                              {installment.paymentMethod && (
                                                <>
                                                  <span>•</span>
                                                  <span>{installment.paymentMethod === 'mobile_money' ? 'M-Pesa' : installment.paymentMethod}</span>
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="font-semibold text-gray-900">
                                            {formatCurrency(installment.amountPaid)}
                                          </div>
                                          {installment.paymentPlanType && (
                                            <div className="text-xs text-gray-500">
                                              {installment.paymentPlanType === 'upfront' || installment.paymentPlanType === 'one_time' 
                                                ? 'One-time' 
                                                : installment.paymentPlanType === 'monthly' 
                                                ? 'Monthly' 
                                                : installment.paymentPlanType === 'per-term'
                                                ? 'Termly'
                                                : installment.paymentPlanType}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500">
                                  No payments recorded yet.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
      )}
    </div>
  );
}

