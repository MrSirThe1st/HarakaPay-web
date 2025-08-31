import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseServerOnly';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    // Check environment variables
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    if (!serviceRoleKey || !supabaseUrl) {
      return NextResponse.json({ 
        error: 'Server configuration error'
      }, { status: 500 });
    }
    
    // Use admin client to get profile (bypasses RLS)
    const adminClient = createAdminClient();
    
    const { data: profile, error } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      return NextResponse.json({ 
        error: 'Profile not found'
      }, { status: 404 });
    }
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    
    return NextResponse.json({ profile });
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error'
    }, { status: 500 });
  }
}
