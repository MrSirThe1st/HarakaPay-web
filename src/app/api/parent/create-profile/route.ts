// src/app/api/parent/create-profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseServerOnly';

// Handle CORS preflight requests
export async function OPTIONS() {
  console.log('🚀 OPTIONS /api/parent/create-profile called');
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function GET() {
  console.log('🚀 GET /api/parent/create-profile called');
  return NextResponse.json({ message: 'API route is working!' });
}

export async function POST(request: NextRequest) {
  console.log('🚀 POST /api/parent/create-profile called');
  console.log('🚀 Request method:', request.method);
  console.log('🚀 Request URL:', request.url);
  
  try {
    // Parse request body
    const profileData = await request.json();
    console.log('Received parent profile data:', profileData);

    // Validate required fields
    const requiredFields = ['user_id', 'first_name', 'last_name', 'email'];
    const missingFields = requiredFields.filter(field => !profileData[field]?.trim());
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Create admin client to bypass RLS
    const adminClient = createAdminClient();

    // Check if profile already exists
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id')
      .eq('user_id', profileData.user_id)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Profile already exists for this user' },
        { status: 400 }
      );
    }

    // Check if parent record already exists
    const { data: existingParent } = await adminClient
      .from('parents')
      .select('id')
      .eq('user_id', profileData.user_id)
      .single();

    if (existingParent) {
      return NextResponse.json(
        { error: 'Parent record already exists for this user' },
        { status: 400 }
      );
    }

    // Create the profile
    const { data: profile, error: profileInsertError } = await adminClient
      .from('profiles')
      .insert({
        user_id: profileData.user_id,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone: profileData.phone || null,
        role: 'parent',
        admin_type: null, // Parents are not platform admins
        school_id: null, // Parents don't belong to a specific school
        avatar_url: null,
        permissions: {}, // Empty permissions object for parents
        is_active: true
      })
      .select()
      .single();

    if (profileInsertError) {
      console.error('Profile creation error:', profileInsertError);
      return NextResponse.json(
        { error: `Failed to create profile: ${profileInsertError.message}` },
        { status: 400 }
      );
    }

    console.log('Parent profile created successfully:', profile.id);

    // Create the parent record
    const { data: parent, error: parentInsertError } = await adminClient
      .from('parents')
      .insert({
        user_id: profileData.user_id,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone: profileData.phone || 'Not provided',
        email: profileData.email,
        address: profileData.address || null,
        is_active: true
      })
      .select()
      .single();

    if (parentInsertError) {
      console.error('Parent record creation error:', parentInsertError);
      
      // Rollback: Delete the profile we just created
      await adminClient
        .from('profiles')
        .delete()
        .eq('id', profile.id);
      
      return NextResponse.json(
        { error: `Failed to create parent record: ${parentInsertError.message}` },
        { status: 400 }
      );
    }

    console.log('Parent record created successfully:', parent.id);

    const response = NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        user_id: profile.user_id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        role: profile.role,
        is_active: profile.is_active,
        created_at: profile.created_at
      },
      parent: {
        id: parent.id,
        user_id: parent.user_id,
        first_name: parent.first_name,
        last_name: parent.last_name,
        phone: parent.phone,
        email: parent.email,
        address: parent.address,
        is_active: parent.is_active,
        created_at: parent.created_at
      }
    });

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;

  } catch (error) {
    console.error('Unexpected error in create-parent-profile:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }
}
