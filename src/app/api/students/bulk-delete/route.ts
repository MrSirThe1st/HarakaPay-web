import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { createAdminClient } from '@/lib/supabaseServerOnly';

export async function DELETE(req: NextRequest) {
  try {
    const { studentIds } = await req.json();

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No student IDs provided' }, 
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient<Database>({ cookies: async () => await cookies() });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // Get user profile to check role and school
    const adminClient = createAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role, school_id, is_active')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' }, 
        { status: 404 }
      );
    }

    if (!profile.is_active) {
      return NextResponse.json(
        { success: false, error: 'Account inactive' }, 
        { status: 403 }
      );
    }

    // Check if user has permission to delete students
    if (!['super_admin', 'platform_admin', 'support_admin', 'school_admin', 'school_staff'].includes(profile.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' }, 
        { status: 403 }
      );
    }

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
