import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';
import { Database } from '@/types/supabase';

// Force dynamic rendering (required for Next.js 16+)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function DELETE(req: NextRequest) {
  try {
    const { studentIds } = await req.json();

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No student IDs provided' },
        { status: 400 }
      );
    }

    const authResult = await authenticateRequest({
      requiredRoles: ['super_admin', 'platform_admin', 'support_admin', 'school_admin', 'school_staff'],
      requireActive: true
    }, req);

    if (isAuthError(authResult)) {
      return authResult;
    }

    const { profile, adminClient } = authResult;

    // For school-level users, ensure they can only delete students from their school
    let deleteQuery = adminClient
      .from('students')
      .delete()
      .in('id', studentIds);

    if (['school_admin', 'school_staff'].includes(profile.role)) {
      if (!profile.school_id) {
        return NextResponse.json(
          { success: false, error: 'School not specified' }, 
          { status: 400 }
        );
      }
      deleteQuery = deleteQuery.eq('school_id', profile.school_id);
    }

    const { error: deleteError, count } = await deleteQuery;

    if (deleteError) {
      console.error('Bulk delete error:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete students' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${count || studentIds.length} students`,
      deletedCount: count || studentIds.length
    });

  } catch (error) {
    console.error('Bulk delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
