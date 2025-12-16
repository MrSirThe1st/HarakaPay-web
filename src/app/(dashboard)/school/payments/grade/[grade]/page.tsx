"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ArrowLeftIcon
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

export default function GradePaymentsPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const grade = params.grade as string;

  const [students, setStudents] = useState<StudentPaymentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchGradePayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grade]);

  const fetchGradePayments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/school/payments/by-grade?grade_level=${encodeURIComponent(grade)}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch payments');
      }

      const gradeData = result.data.byGrade[grade] || [];
      setStudents(gradeData);
    } catch (error) {
      console.error('Error fetching grade payments:', error);
      setError(error instanceof Error ? error.message : 'Failed to load payment data');
    } finally {
      setIsLoading(false);
    }
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Data</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => fetchGradePayments()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const paidCount = students.filter(s => s.paymentStatus === 'fully_paid').length;
  const partiallyPaidCount = students.filter(s => s.paymentStatus === 'partially_paid').length;
  const notPaidCount = students.filter(s => s.paymentStatus === 'not_paid').length;
  const totalDue = students.reduce((sum, s) => sum + s.totalDue, 0);
  const totalPaid = students.reduce((sum, s) => sum + s.paidAmount, 0);
  const collectionPercentage = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/school/payments')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grade {grade}</h1>
          <p className="text-sm text-gray-600">{students.length} student{students.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Collection Rate</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{collectionPercentage}%</div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${collectionPercentage}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Fully Paid</span>
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-green-700">{paidCount}</div>
          <div className="text-sm text-gray-500 mt-1">of {students.length} students</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Partially Paid</span>
            <ClockIcon className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="text-3xl font-bold text-yellow-700">{partiallyPaidCount}</div>
          <div className="text-sm text-gray-500 mt-1">students</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Not Paid</span>
            <XCircleIcon className="h-5 w-5 text-red-500" />
          </div>
          <div className="text-3xl font-bold text-red-700">{notPaidCount}</div>
          <div className="text-sm text-gray-500 mt-1">students</div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <span className="text-sm text-gray-600">Total Due</span>
            <div className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalDue)}</div>
          </div>
          <div>
            <span className="text-sm text-gray-600">Total Collected</span>
            <div className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalPaid)}</div>
          </div>
          <div>
            <span className="text-sm text-gray-600">Remaining</span>
            <div className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(totalDue - totalPaid)}</div>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Students</h3>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('No students found in this grade')}</p>
          </div>
        ) : (
          <div>
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
                        <div className="flex items-center gap-3 flex-wrap">
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
    </div>
  );
}