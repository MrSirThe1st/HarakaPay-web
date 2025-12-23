// src/app/api/parent/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseServerOnly';

// Force dynamic rendering (required for Next.js 16+)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Handle CORS preflight requests
export async function OPTIONS() {
  console.log('🚀 OPTIONS /api/parent/profile called');
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function GET(request: NextRequest) {
  console.log('🚀 GET /api/parent/profile called');
  
  try {
    // Get user_id from query params
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    
    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    // Create admin client to bypass RLS
    const adminClient = createAdminClient();

    console.log('Fetching parent profile for user_id:', user_id);

    // Fetch both profile and parent data
    const [profileResult, parentResult] = await Promise.all([
      adminClient
        .from('profiles')
        .select('*')
        .eq('user_id', user_id)
        .eq('role', 'parent')
        .single(),
      
      adminClient
        .from('parents')
        .select('*')
        .eq('user_id', user_id)
        .single()
    ]);

    console.log('Profile result:', profileResult);
    console.log('Parent result:', parentResult);

    if (profileResult.error && profileResult.error.code === 'PGRST116') {
      return NextResponse.json(
        { 
          error: 'No parent profile found',
          details: 'Profile record does not exist for this user',
          user_id 
        },
        { status: 404 }
      );
    }

    if (parentResult.error && parentResult.error.code === 'PGRST116') {
      return NextResponse.json(
        { 
          error: 'No parent record found',
          details: 'Parent record does not exist for this user',
          user_id,
          profile_exists: !!profileResult.data
        },
        { status: 404 }
      );
    }

    if (profileResult.error) {
      console.error('Profile fetch error:', profileResult.error);
      return NextResponse.json(
        { error: `Profile fetch failed: ${profileResult.error.message}` },
        { status: 400 }
      );
    }

    if (parentResult.error) {
      console.error('Parent fetch error:', parentResult.error);
      return NextResponse.json(
        { error: `Parent fetch failed: ${parentResult.error.message}` },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      profile: profileResult.data,
      parent: parentResult.data
    });

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;

  } catch (error) {
    console.error('Unexpected error in parent profile fetch:', error);
    const response = NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }
}