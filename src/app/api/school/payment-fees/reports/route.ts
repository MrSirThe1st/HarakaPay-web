import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';
import { createAdminClient } from "@/lib/supabaseServerOnly";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff']
    }, request);
    if (isAuthError(authResult)) return authResult;
    const { user, profile, adminClient } = authResult;

    if (!profile.school_id) {
      return NextResponse.json(
        { success: false, error: "School association required" },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    // Build query for transaction snapshots
    let query = adminClient
      .from("transaction_fee_snapshots")
      .select("*")
      .eq("school_id", profile.school_id);

    // Apply filters
    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    const { data: snapshots, error: snapshotsError } = await query;

    if (snapshotsError) {
      console.error("Error fetching fee snapshots:", snapshotsError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch fee data" },
        { status: 500 }
      );
    }

    // Calculate totals
    const totalFeesOwed = snapshots?.reduce((sum, snapshot) => sum + Number(snapshot.fee_amount), 0) || 0;
    const transactionCount = snapshots?.length || 0;

    // Get current active fee rate
    const { data: activeFeeRate } = await adminClient
      .from("payment_fee_rates")
      .select("fee_percentage")
      .eq("school_id", profile.school_id)
      .eq("status", "active")
      .single();

    // Group by month for trend analysis
    const monthlyData = new Map<string, { fees: number; count: number }>();
    snapshots?.forEach((snapshot) => {
      const month = snapshot.created_at.substring(0, 7); // YYYY-MM
      const existing = monthlyData.get(month);
      if (existing) {
        existing.fees += Number(snapshot.fee_amount);
        existing.count += 1;
      } else {
        monthlyData.set(month, {
          fees: Number(snapshot.fee_amount),
          count: 1,
        });
      }
    });

    const monthlyTrends = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        fees_owed: Number(data.fees.toFixed(2)),
        transaction_count: data.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total_fees_owed: Number(totalFeesOwed.toFixed(2)),
          transaction_count: transactionCount,
          current_fee_percentage: activeFeeRate?.fee_percentage || 2.5,
          date_range: {
            start: startDate || "All time",
            end: endDate || "Present",
          },
        },
        monthly_trends: monthlyTrends,
        transactions: snapshots?.map(snapshot => ({
          id: snapshot.id,
          payment_id: snapshot.payment_id,
          fee_amount: Number(snapshot.fee_amount),
          fee_percentage: snapshot.fee_percentage,
          base_amount: Number(snapshot.base_amount),
          total_amount: Number(snapshot.total_amount),
          payment_method: snapshot.payment_method,
          payment_status: snapshot.payment_status,
          created_at: snapshot.created_at,
        })) || [],
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
