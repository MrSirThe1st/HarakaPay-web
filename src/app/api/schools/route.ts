// src/app/api/schools/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabaseServerOnly';

export async function GET(_request: NextRequest) {
  try {
    // Fix 1: Await cookies() for Next.js 15+ compatibility
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication using regular client
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Authenticated user in /api/schools:', user.id);

    // Fix 2: Use admin client for ALL database operations (consistent hybrid approach)
    const adminClient = createAdminClient();

    // Get user profile using admin client (bypasses RLS)
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role, school_id, is_active, first_name, last_name')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (!profile.is_active) {
      return NextResponse.json({ error: 'Account inactive' }, { status: 403 });
    }

    console.log('User profile found:', { role: profile.role, school_id: profile.school_id });

    // Check if user has permission to view schools (application-level check)
    const allowedRoles = ['super_admin', 'platform_admin', 'support_admin', 'school_admin', 'school_staff'];
    if (!allowedRoles.includes(profile.role)) {
      return NextResponse.json({ 
        error: `Role '${profile.role}' cannot view schools` 
      }, { status: 403 });
    }
    
    // Query schools using admin client based on role (business logic)
    let selectFields = '*';

    if (profile.role === 'support_admin') {
      // Support admins see basic info only (no payment settings)
      selectFields = 'id, name, address, contact_email, contact_phone, status, verification_status, created_at';
    }

    let query = adminClient.from('schools').select(selectFields);

    if (profile.role === 'school_admin' || profile.role === 'school_staff') {
      // School staff can only see their own school
      if (!profile.school_id) {
        return NextResponse.json({
          error: 'School staff must be assigned to a school'
        }, { status: 403 });
      }
      query = query.eq('id', profile.school_id);
    }
    // Super admins and platform admins see everything

    const { data: schools, error: schoolsError } = await query;
    
    if (schoolsError) {
      console.error('Schools query error:', schoolsError);
      return NextResponse.json({ 
        error: `Failed to fetch schools: ${schoolsError.message}` 
      }, { status: 500 });
    }
    
    console.log(`Successfully fetched ${schools?.length || 0} schools for role: ${profile.role}`);
    
    return NextResponse.json({ 
      schools: schools || [],
      meta: {
        total: schools?.length || 0,
        user_role: profile.role,
        user_school_id: profile.school_id
      }
    });
    
  } catch (error) {
    console.error('API error in /api/schools:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}