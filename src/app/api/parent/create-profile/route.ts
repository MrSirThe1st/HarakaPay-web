// src/app/api/parent/create-profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseServerOnly';

// Force dynamic rendering (required for Next.js 16+)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  [key: string]: unknown;
}

interface Parent {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  [key: string]: unknown;
}

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  console.log('🚀 OPTIONS /api/parent/create-profile called');
  console.log('🔍 Request headers:', Object.fromEntries(request.headers.entries()));
  console.log('🔍 Request origin:', request.headers.get('origin'));

  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

export async function GET() {
  console.log('🚀 GET /api/parent/create-profile called');
  return NextResponse.json({ message: 'API route is working!' });
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('🚀🚀🚀 POST /api/parent/create-profile ENTRY POINT 🚀🚀🚀');
  console.log('🚀 Request method:', request.method);
  console.log('🚀 Request URL:', request.url);
  console.log('🚀 Headers:', Object.fromEntries(request.headers.entries()));

  try {
    // Parse request body
    console.log('📝 About to parse request body...');
    const profileData = await request.json();
    console.log('✅ Request body parsed successfully');
    console.log('📋 Received parent profile data:', profileData);

    // Validate required fields
    const requiredFields = ['user_id', 'first_name', 'last_name', 'phone'];
    const missingFields = requiredFields.filter(field => !profileData[field]?.trim?.());

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Use provided values (email is optional, generate from phone if not provided)
    const firstName = profileData.first_name.trim();
    const lastName = profileData.last_name.trim();
    const phone = profileData.phone.trim();
    const email = profileData.email?.trim() || `${phone.replace(/\D/g, '')}@harakapay.app`;

    // Create admin client to bypass RLS
    const adminClient = createAdminClient();

    // Check if profile already exists
    const { data: existingProfile, error: profileCheckError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', profileData.user_id)
      .eq('role', 'parent')
      .single();

    // Check if parent record already exists
    const { data: existingParent, error: parentCheckError } = await adminClient
      .from('parents')
      .select('*')
      .eq('user_id', profileData.user_id)
      .single();

    // If both profile and parent exist, return them
    if (existingProfile && existingParent) {
      console.log('Profile and parent already exist, returning existing data');
      const typedProfile = existingProfile as Profile;
      const typedParent = existingParent as Parent;
      return NextResponse.json({
        success: true,
        profile: {
          id: typedProfile.id,
          user_id: typedProfile.user_id,
          first_name: typedProfile.first_name,
          last_name: typedProfile.last_name,
          phone: typedProfile.phone,
          role: typedProfile.role,
          is_active: typedProfile.is_active,
          created_at: typedProfile.created_at
        },
        parent: {
          id: typedParent.id,
          user_id: typedParent.user_id,
          first_name: typedParent.first_name,
          last_name: typedParent.last_name,
          phone: typedParent.phone,
          email: typedParent.email,
          address: typedParent.address,
          is_active: typedParent.is_active,
          created_at: typedParent.created_at
        }
      });
    }

    // If only profile exists but not parent, create parent record
    if (existingProfile && !existingParent) {
      console.log('Profile exists but parent record missing, creating parent record');

      const { data: parent, error: parentInsertError } = await adminClient
        .from('parents')
        .insert({
          user_id: profileData.user_id,
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          email: email,
          address: profileData.address || null,
          is_active: true
        } as any)
        .select()
        .single();

      if (parentInsertError) {
        console.error('Parent record creation error:', parentInsertError);
        return NextResponse.json(
          { error: `Failed to create parent record: ${parentInsertError.message}` },
          { status: 400 }
        );
      }

      const typedProfile = existingProfile as Profile;
      const typedParent = parent as Parent;
      return NextResponse.json({
        success: true,
        profile: {
          id: typedProfile.id,
          user_id: typedProfile.user_id,
          first_name: typedProfile.first_name,
          last_name: typedProfile.last_name,
          phone: typedProfile.phone,
          role: typedProfile.role,
          is_active: typedProfile.is_active,
          created_at: typedProfile.created_at
        },
        parent: {
          id: typedParent.id,
          user_id: typedParent.user_id,
          first_name: typedParent.first_name,
          last_name: typedParent.last_name,
          phone: typedParent.phone,
          email: typedParent.email,
          address: typedParent.address,
          is_active: typedParent.is_active,
          created_at: typedParent.created_at
        }
      });
    }

    // If only parent exists but not profile, create profile record
    if (!existingProfile && existingParent) {
      console.log('Parent record exists but profile missing, creating profile record');

      const { data: profile, error: profileInsertError } = await adminClient
        .from('profiles')
        .insert({
          user_id: profileData.user_id,
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          role: 'parent',
          admin_type: null,
          school_id: null,
          avatar_url: null,
          permissions: {},
          is_active: true
        } as any)
        .select()
        .single();

      if (profileInsertError) {
        console.error('Profile creation error:', profileInsertError);
        return NextResponse.json(
          { error: `Failed to create profile: ${profileInsertError.message}` },
          { status: 400 }
        );
      }

      const typedProfile = profile as Profile;
      const typedParent = existingParent as Parent;
      return NextResponse.json({
        success: true,
        profile: {
          id: typedProfile.id,
          user_id: typedProfile.user_id,
          first_name: typedProfile.first_name,
          last_name: typedProfile.last_name,
          phone: typedProfile.phone,
          role: typedProfile.role,
          is_active: typedProfile.is_active,
          created_at: typedProfile.created_at
        },
        parent: {
          id: typedParent.id,
          user_id: typedParent.user_id,
          first_name: typedParent.first_name,
          last_name: typedParent.last_name,
          phone: typedParent.phone,
          email: typedParent.email,
          address: typedParent.address,
          is_active: typedParent.is_active,
          created_at: typedParent.created_at
        }
      });
    }

    // Create the profile using UPSERT to handle race conditions
    const { data: profile, error: profileInsertError } = await adminClient
      .from('profiles')
      .upsert({
        user_id: profileData.user_id,
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        role: 'parent',
        admin_type: null, // Parents are not platform admins
        school_id: null, // Parents don't belong to a specific school
        avatar_url: null,
        permissions: {}, // Empty permissions object for parents
        is_active: true
      } as never, {
        onConflict: 'user_id',
        ignoreDuplicates: false
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

    const typedProfile = profile as Profile;
    console.log('Parent profile created successfully:', typedProfile.id);

    // Create the parent record using UPSERT to handle race conditions
    const { data: parent, error: parentInsertError } = await adminClient
      .from('parents')
      .upsert({
        user_id: profileData.user_id,
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        email: email,
        address: profileData.address || null,
        is_active: true
      } as never, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (parentInsertError) {
      console.error('Parent record creation error:', parentInsertError);

      // Rollback: Delete the profile we just created
      await adminClient
        .from('profiles')
        .delete()
        .eq('id', typedProfile.id);

      return NextResponse.json(
        { error: `Failed to create parent record: ${parentInsertError.message}` },
        { status: 400 }
      );
    }

    const typedParent = parent as Parent;
    console.log('Parent record created successfully:', typedParent.id);

    const response = NextResponse.json({
      success: true,
      profile: {
        id: typedProfile.id,
        user_id: typedProfile.user_id,
        first_name: typedProfile.first_name,
        last_name: typedProfile.last_name,
        phone: typedProfile.phone,
        role: typedProfile.role,
        is_active: typedProfile.is_active,
        created_at: typedProfile.created_at
      },
      parent: {
        id: typedParent.id,
        user_id: typedParent.user_id,
        first_name: typedParent.first_name,
        last_name: typedParent.last_name,
        phone: typedParent.phone,
        email: typedParent.email,
        address: typedParent.address,
        is_active: typedParent.is_active,
        created_at: typedParent.created_at
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
