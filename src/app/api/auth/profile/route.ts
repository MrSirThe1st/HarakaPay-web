import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseServerOnly';

// Debug GET handler
export async function GET() {
  return NextResponse.json({
    message: 'Profile API is working',
    methods: ['POST'],
    version: '1.0.0'
  });
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Use admin client to get profile (bypasses RLS)
    let adminClient;
    try {
      adminClient = createAdminClient();
    } catch (clientError) {
      console.error('Failed to create admin client:', clientError);
      return NextResponse.json({
        error: 'Server configuration error',
        details: clientError instanceof Error ? clientError.message : 'Unknown error'
      }, { status: 500 });
    }

    console.log('Fetching profile for userId:', userId);

    const { data: profile, error } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Database error fetching profile:', error);
      return NextResponse.json({
        error: 'Profile not found',
        details: error.message
      }, { status: 404 });
    }
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    
    return NextResponse.json({ profile });
    
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
