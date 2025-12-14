// src/app/api/parent/select-school/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseServerOnly';

// Handle CORS preflight requests
export async function OPTIONS() {
  console.log('🚀 OPTIONS /api/parent/select-school called');
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function POST(request: NextRequest) {
  console.log('🚀 POST /api/parent/select-school called');
  
  try {
    // Parse request body
    const { user_id, school_id } = await request.json();
    
    if (!user_id || !school_id) {
      return NextResponse.json(
        { error: 'user_id and school_id are required' },
        { status: 400 }
      );
    }

    // Create admin client to bypass RLS
    const adminClient = createAdminClient();

    // Update the parent's profile with the selected school
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ school_id } as never)
      .eq('user_id', user_id)
      .eq('role', 'parent');

    if (updateError) {
      console.error('Error updating parent school:', updateError);
      return NextResponse.json(
        { error: `Failed to select school: ${updateError.message}` },
        { status: 400 }
      );
    }

    console.log(`Successfully updated parent ${user_id} to school ${school_id}`);

    const response = NextResponse.json({
      success: true,
      message: 'School selected successfully',
      user_id,
      school_id
    });

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;

  } catch (error) {
    console.error('Unexpected error in select-school:', error);
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
