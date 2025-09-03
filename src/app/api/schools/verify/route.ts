// src/app/api/schools/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabaseServerOnly';

export async function PATCH(request: NextRequest) {
  try {
    // Fix 1: Await cookies() for Next.js 15+ compatibility
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Check authentication using regular client
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Authenticated user in /api/schools/verify:', user.id);

    // Use admin client for database operations
    const adminClient = createAdminClient();

    // Get user profile using admin client (bypasses RLS)
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role, is_active, first_name, last_name')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (!profile.is_active) {
      return NextResponse.json({ error: 'Account inactive' }, { status: 403 });
    }

    console.log('User profile found:', { role: profile.role });

    // Check if user has permission to verify schools
    const canVerifySchools = profile.role === 'super_admin' || profile.role === 'platform_admin';
    if (!canVerifySchools) {
      return NextResponse.json({ 
        error: `Role '${profile.role}' cannot verify schools` 
      }, { status: 403 });
    }

    // Parse request body
    const { schoolId, verificationStatus } = await request.json();

    if (!schoolId || !verificationStatus) {
      return NextResponse.json({ 
        error: 'Missing required fields: schoolId and verificationStatus' 
      }, { status: 400 });
    }

    if (!['verified', 'rejected', 'pending'].includes(verificationStatus)) {
      return NextResponse.json({ 
        error: 'Invalid verification status. Must be: verified, rejected, or pending' 
      }, { status: 400 });
    }

    // Update school verification status using admin client
    const { data: updatedSchool, error: updateError } = await adminClient
      .from('schools')
      .update({ 
        verification_status: verificationStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', schoolId)
      .select()
      .single();

    if (updateError) {
      console.error('School verification update error:', updateError);
      return NextResponse.json({ 
        error: `Failed to update school verification: ${updateError.message}` 
      }, { status: 500 });
    }

    // Log the action for audit trail
    await adminClient.from("audit_logs").insert({
      user_id: user.id,
      action: "VERIFY_SCHOOL",
      entity_type: "school",
      entity_id: schoolId,
      details: {
        school_name: updatedSchool.name,
        verification_status: verificationStatus,
        verified_by_role: profile.role,
        admin_name: `${profile.first_name} ${profile.last_name}`
      }
    });

    console.log(`Successfully updated school ${schoolId} verification status to: ${verificationStatus}`);

    return NextResponse.json({ 
      success: true,
      school: updatedSchool,
      message: `School verification status updated to ${verificationStatus}`
    });
    
  } catch (error) {
    console.error('API error in /api/schools/verify:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
