"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/hooks/useTranslation';
import { CardSkeleton } from "@/components/ui/skeleton";
import { getGradeByValue, getAllLevels } from '@/lib/congoleseGrades';

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

interface GradesByLevel {
  [key: string]: Array<{
    gradeValue: string;
    gradeLabel: string;
    students: StudentPaymentData[];
  }>;
}

export function PaymentsByGradeView({ isParentLoading = false }: PaymentsByGradeViewProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [byGrade, setByGrade] = useState<Record<string, StudentPaymentData[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentsByGrade();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPaymentsByGrade = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/school/payments/by-grade`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch payments by grade');
      }

      setByGrade(result.data.byGrade || {});
    } catch (error) {
      console.error('Error fetching payments by grade:', error);
      setError(error instanceof Error ? error.message : 'Failed to load payment data');
    } finally {
      setIsLoading(false);
    }
  };

  const groupGradesByLevel = (): GradesByLevel => {
    const allLevels = getAllLevels();
    const grouped: GradesByLevel = {};

    // Initialize with all Congolese education levels
    allLevels.forEach(level => {
      grouped[level] = [];
    });

    Object.entries(byGrade).forEach(([gradeValue, students]) => {
      const gradeInfo = getGradeByValue(gradeValue);

      if (gradeInfo) {
        grouped[gradeInfo.level].push({
          gradeValue: gradeInfo.value,
          gradeLabel: gradeInfo.label,
          students
        });
      }
      // Ignore unrecognized grades - they shouldn't exist in a properly set up system
    });

    // Sort within each level by order
    Object.keys(grouped).forEach(level => {
      grouped[level].sort((a, b) => {
        const gradeA = getGradeByValue(a.gradeValue);
        const gradeB = getGradeByValue(b.gradeValue);
        if (gradeA && gradeB) {
          return gradeA.order - gradeB.order;
        }
        return a.gradeLabel.localeCompare(b.gradeLabel);
      });
    });

    return grouped;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleGradeClick = (grade: string) => {
    router.push(`/school/payments/grade/${encodeURIComponent(grade)}`);
  };

  if (isLoading || isParentLoading) {
    return (
      <div className="space-y-4">
        {/* Grade Blocks Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
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
            onClick={() => fetchPaymentsByGrade()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const gradesByLevel = groupGradesByLevel();
  const allLevels = getAllLevels();
  const levels = allLevels;

  return (
    <div className="space-y-8">
      {Object.keys(byGrade).length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">{t('No payment data available')}</p>
        </div>
      ) : (
        <>
          {levels.map(level => {
            const gradesInLevel = gradesByLevel[level] || [];
            if (gradesInLevel.length === 0) return null;

            return (
              <div key={level} className="space-y-4">
                {/* Level Header */}
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900">{level}</h2>
                  <span className="text-sm text-gray-500">
                    ({gradesInLevel.length} grade{gradesInLevel.length !== 1 ? 's' : ''})
                  </span>
                </div>

                {/* Grade Blocks for this Level */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {gradesInLevel.map(({ gradeValue, gradeLabel, students }) => {
                    const paidCount = students.filter(s => s.paymentStatus === 'fully_paid').length;
                    const partiallyPaidCount = students.filter(s => s.paymentStatus === 'partially_paid').length;
                    const notPaidCount = students.filter(s => s.paymentStatus === 'not_paid').length;
                    const totalDue = students.reduce((sum, s) => sum + s.totalDue, 0);
                    const totalPaid = students.reduce((sum, s) => sum + s.paidAmount, 0);
                    const collectionPercentage = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;

                    return (
                      <button
                        key={gradeValue}
                        onClick={() => handleGradeClick(gradeValue)}
                        className="p-6 rounded-lg border-2 border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all text-left"
                      >
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-gray-900">
                            {gradeLabel}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {students.length} student{students.length !== 1 ? 's' : ''}
                          </p>
                        </div>

                        {/* Payment Stats */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Collection:</span>
                            <span className="font-semibold text-gray-900">{collectionPercentage}%</span>
                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{ width: `${collectionPercentage}%` }}
                            />
                          </div>

                          <div className="pt-2 border-t border-gray-200">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-green-700 flex items-center gap-1">
                                <CheckCircleIcon className="h-3 w-3" />
                                Paid: {paidCount}
                              </span>
                              <span className="text-yellow-700 flex items-center gap-1">
                                <ClockIcon className="h-3 w-3" />
                                Partial: {partiallyPaidCount}
                              </span>
                            </div>
                            <div className="text-xs text-red-700 flex items-center gap-1">
                              <XCircleIcon className="h-3 w-3" />
                              Not Paid: {notPaidCount}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-gray-200">
                            <div className="text-xs text-gray-600">Total</div>
                            <div className="font-bold text-gray-900">{formatCurrency(totalPaid)}</div>
                            <div className="text-xs text-gray-500">of {formatCurrency(totalDue)}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

