import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';

// Force dynamic rendering (required for Next.js 16+)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin'],
      requireActive: true
    }, request);

    if (isAuthError(authResult)) {
      return authResult;
    }

    const { profile, adminClient } = authResult;

    if (!profile.school_id) {
      return NextResponse.json({ error: 'No school associated with user' }, { status: 400 });
    }

    const body = await request.json();
    const { name, start_date, end_date, is_active } = body;

    // Validate required fields
    if (!name || !start_date || !end_date) {
      return NextResponse.json({
        error: 'Name, start date, and end date are required'
      }, { status: 400 });
    }

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({
        error: 'Invalid date format'
      }, { status: 400 });
    }

    if (endDate <= startDate) {
      return NextResponse.json({
        error: 'End date must be after start date'
      }, { status: 400 });
    }

    // If setting this as active, deactivate all other academic years
    if (is_active) {
      await adminClient
        .from('academic_years')
        .update({ is_active: false })
        .eq('school_id', profile.school_id)
        .neq('id', id);
    }

    // Update the academic year
    const { data: updatedYear, error: updateError } = await adminClient
      .from('academic_years')
      .update({
        name,
        start_date,
        end_date,
        is_active: is_active ?? undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('school_id', profile.school_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating academic year:', updateError);
      return NextResponse.json({ error: 'Failed to update academic year' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      academic_year: updatedYear
    });

  } catch (error) {
    console.error('Error in academic year update API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin'],
      requireActive: true
    }, request);

    if (isAuthError(authResult)) {
      return authResult;
    }

    const { profile, adminClient } = authResult;

    if (!profile.school_id) {
      return NextResponse.json({ error: 'No school associated with user' }, { status: 400 });
    }

    // Check if academic year has associated fee structures
    const { data: feeStructures } = await adminClient
      .from('fee_structures')
      .select('id')
      .eq('academic_year_id', id)
      .limit(1);

    if (feeStructures && feeStructures.length > 0) {
      return NextResponse.json({
        error: 'Cannot delete academic year with associated fee structures'
      }, { status: 400 });
    }

    // Delete the academic year
    const { error: deleteError } = await adminClient
      .from('academic_years')
      .delete()
      .eq('id', id)
      .eq('school_id', profile.school_id);

    if (deleteError) {
      console.error('Error deleting academic year:', deleteError);
      return NextResponse.json({ error: 'Failed to delete academic year' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Academic year deleted successfully'
    });

  } catch (error) {
    console.error('Error in academic year delete API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}