import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabaseServerOnly';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to determine role and permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, school_id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if user has permission to view schools
    const allowedRoles = ['super_admin', 'platform_admin', 'support_admin'];
    if (!allowedRoles.includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    // Use admin client for database operations - NO RLS APPLIED
    const adminClient = createAdminClient();
    
    let query = adminClient.from('schools').select('*');
    
    // Apply business logic based on role
    if (profile.role === 'school_admin') {
      query = query.eq('id', profile.school_id);
    } else if (profile.role === 'support_admin') {
      // Support admins see basic info only
      query = query.select('id, name, address, contact_email, contact_phone, status');
    }
    // Super admins and platform admins see everything
    
    const { data: schools, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ schools: schools || [] });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = await getUserIdFromAuthHeader(authHeader);
    
    // Check permissions for creating schools
    const { allowed, profile } = await checkUserPermission(userId, 'create_schools');
    
    if (!allowed) {
      return NextResponse.json({ error: 'Insufficient permissions to create schools' }, { status: 403 });
    }
    
    const schoolData = await request.json();
    
    // Use admin client to create school
    const adminClient = createAdminClient();
    const { data: school, error } = await adminClient
      .from('schools')
      .insert({
        name: schoolData.name,
        address: schoolData.address,
        contact_email: schoolData.contact_email,
        contact_phone: schoolData.contact_phone,
        registration_number: schoolData.registration_number,
        verification_status: 'pending',
        payment_transparency: { platform_admin_access: false }
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ school });
    
  } catch (error) {
    console.error('School creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to extract user ID from auth header
async function getUserIdFromAuthHeader(authHeader: string): Promise<string> {
  // Remove 'Bearer ' prefix
  const token = authHeader.replace('Bearer ', '');
  
  // Use regular auth client to verify token
  const authClient = createServerAuthClient();
  const { data: { user }, error } = await authClient.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Invalid token');
  }
  
  return user.id;
}
