import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';

// Force dynamic rendering (required for Next.js 16+)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface School {
  id: string;
  name: string;
}

interface TransactionSnapshot {
  school_id: string;
  fee_amount: number;
  created_at: string;
  school: School | School[];
  [key: string]: unknown;
}

interface FeeRate {
  school_id: string;
  fee_percentage: number;
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['super_admin', 'platform_admin']
    }, request);
    if (isAuthError(authResult)) return authResult;
    const { adminClient } = authResult;

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const schoolId = searchParams.get("school_id");

    // Build query for transaction snapshots with aggregation
    let query = adminClient
      .from("transaction_fee_snapshots")
      .select(`
        school_id,
        fee_amount,
        created_at,
        school:schools(id, name)
      `);

    // Apply filters
    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }
    if (schoolId) {
      query = query.eq("school_id", schoolId);
    }

    const { data: snapshots, error: snapshotsError } = await query;

    if (snapshotsError) {
      console.error("Error fetching fee snapshots:", snapshotsError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch fee data" },
        { status: 500 }
      );
    }

    // Aggregate by school
    const schoolAggregates = new Map<string, {
      school_id: string;
      school_name: string;
      total_fees_owed: number;
      transaction_count: number;
      last_transaction_date?: string;
    }>();

    (snapshots as TransactionSnapshot[] | null)?.forEach((snapshot) => {
      const schoolId = snapshot.school_id;
      const existing = schoolAggregates.get(schoolId);

      if (existing) {
        existing.total_fees_owed += Number(snapshot.fee_amount);
        existing.transaction_count += 1;
        if (!existing.last_transaction_date || snapshot.created_at > existing.last_transaction_date) {
          existing.last_transaction_date = snapshot.created_at;
        }
      } else {
        const schoolData = Array.isArray(snapshot.school) ? snapshot.school[0] : snapshot.school;
        schoolAggregates.set(schoolId, {
          school_id: schoolId,
          school_name: schoolData?.name || "Unknown School",
          total_fees_owed: Number(snapshot.fee_amount),
          transaction_count: 1,
          last_transaction_date: snapshot.created_at,
        });
      }
    });

    // Get active fee rates for each school
    const { data: activeFeeRates } = await adminClient
      .from("payment_fee_rates")
      .select("school_id, fee_percentage")
      .eq("status", "active");

    const feeRateMap = new Map(
      (activeFeeRates as FeeRate[] | null)?.map((rate) => [rate.school_id, rate.fee_percentage]) || []
    );

    // Convert to array and add current fee percentage
    const schoolsData = Array.from(schoolAggregates.values()).map((school) => ({
      ...school,
      current_fee_percentage: feeRateMap.get(school.school_id) || 2.5,
      total_fees_owed: Number(school.total_fees_owed.toFixed(2)),
    }));

    // Sort by total fees owed descending
    schoolsData.sort((a, b) => b.total_fees_owed - a.total_fees_owed);

    // Calculate summary
    const summary = {
      total_fees_owed: Number(schoolsData.reduce((sum, school) => sum + school.total_fees_owed, 0).toFixed(2)),
      total_transactions: schoolsData.reduce((sum, school) => sum + school.transaction_count, 0),
      schools_count: schoolsData.length,
      date_range: {
        start: startDate || "All time",
        end: endDate || "Present",
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        summary,
        schools: schoolsData,
      },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
