import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';
import { Database } from '@/types/supabase';

type SchoolUpdate = Database['public']['Tables']['schools']['Update'];

export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff'],
      requireActive: true
    }, request);

    if (isAuthError(authResult)) {
      return authResult;
    }

    const { profile, adminClient } = authResult;

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
    const { data: updatedSchool, error: updateError } = await adminClient
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

export async function GET(_request: NextRequest) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff'],
      requireActive: true
    }, _request);

    if (isAuthError(authResult)) {
      return authResult;
    }

    const { profile, adminClient } = authResult;

    if (!profile.school_id) {
      return NextResponse.json({ error: 'No school associated with user' }, { status: 400 });
    }

    // Get school data
    const { data: school, error: schoolError } = await adminClient
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
