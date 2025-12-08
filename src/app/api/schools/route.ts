// src/app/api/schools/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';

export async function GET(_request: NextRequest) {
  try {
    // Authenticate user with existing helper
    const authResult = await authenticateRequest({
      requiredRoles: ['super_admin', 'platform_admin', 'support_admin', 'school_admin', 'school_staff']
    }, _request);

    if (isAuthError(authResult)) {
      return authResult;
    }

    const { user, profile, adminClient } = authResult;
    console.log('Authenticated user in /api/schools:', user.id);
    
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