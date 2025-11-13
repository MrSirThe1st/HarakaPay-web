import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

type SchoolUpdate = Database['public']['Tables']['schools']['Update'];

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies: async () => await cookies() });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile to check school access
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('school_id, role')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if user has permission to update school settings
    if (!['school_admin', 'school_staff'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    if (!profile.school_id) {
      return NextResponse.json({ error: 'No school associated with user' }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const { 
      name, 
      address, 
      contact_email, 
      contact_phone, 
      registration_number, 
      currency, 
      payment_provider, 
      logo_url 
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'School name is required' }, { status: 400 });
    }

    // Prepare update data
    const updateData: SchoolUpdate = {
      name,
      address: address || null,
      contact_email: contact_email || null,
      contact_phone: contact_phone || null,
      registration_number: registration_number || null,
      currency: currency || 'USD',
      payment_provider: payment_provider || null,
      logo_url: logo_url || null,
      updated_at: new Date().toISOString(),
    };

    // Update school
    const { data: updatedSchool, error: updateError } = await supabase
      .from('schools')
      .update(updateData)
      .eq('id', profile.school_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating school:', updateError);
      return NextResponse.json({ error: 'Failed to update school' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      school: updatedSchool 
    });

  } catch (error) {
    console.error('Error in school update API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies: async () => await cookies() });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile to check school access
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('school_id, role')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if user has permission to view school settings
    if (!['school_admin', 'school_staff'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    if (!profile.school_id) {
      return NextResponse.json({ error: 'No school associated with user' }, { status: 400 });
    }

    // Get school data
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select('*')
      .eq('id', profile.school_id)
      .single();

    if (schoolError) {
      console.error('Error fetching school:', schoolError);
      return NextResponse.json({ error: 'Failed to fetch school data' }, { status: 500 });
    }

    return NextResponse.json({ school });

  } catch (error) {
    console.error('Error in school get API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
