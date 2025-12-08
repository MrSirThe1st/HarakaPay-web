// src/app/api/admin/list/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';

export async function GET(_request: NextRequest) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['super_admin', 'platform_admin']
    }, _request);

    if (isAuthError(authResult)) {
      return authResult;
    }

    const { user, profile, adminClient } = authResult;

    // Get all platform admins (excluding school admins)
    const { data: admins, error: adminsError } = await adminClient
      .from('profiles')
      .select(`
        id,
        user_id,
        first_name,
        last_name,
        role,
        admin_type,
        phone,
        is_active,
        created_at,
        updated_at
      `)
      .in('role', ['super_admin', 'platform_admin', 'support_admin'])
      .order('created_at', { ascending: false });

    if (adminsError) {
      console.error('Admins fetch error:', adminsError);
      return NextResponse.json({ 
        error: `Failed to fetch admins: ${adminsError.message}` 
      }, { status: 500 });
    }

    // Get auth user details for each admin
    const adminsWithAuth = await Promise.all(
      (admins || []).map(async (admin) => {
        try {
          const { data: authUser, error: authUserError } = await adminClient.auth.admin.getUserById(admin.user_id);
          
          if (authUserError || !authUser.user) {
            return {
              ...admin,
              email: 'Email not available',
              last_sign_in_at: null,
              email_confirmed_at: null
            };
          }

          return {
            ...admin,
            email: authUser.user.email,
            last_sign_in_at: authUser.user.last_sign_in_at,
            email_confirmed_at: authUser.user.email_confirmed_at
          };
        } catch (error) {
          console.error(`Error fetching auth user for admin ${admin.user_id}:`, error);
          return {
            ...admin,
            email: 'Email not available',
            last_sign_in_at: null,
            email_confirmed_at: null
          };
        }
      })
    );

    console.log(`Successfully fetched ${adminsWithAuth.length} platform admins for user: ${user.id}`);

    return NextResponse.json({ 
      success: true,
      admins: adminsWithAuth,
      meta: {
        total: adminsWithAuth.length,
        user_role: profile.role
      }
    });
    
  } catch (error) {
    console.error('API error in /api/admin/list:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
