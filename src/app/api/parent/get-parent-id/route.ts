import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createServerAuthClient } from '@/lib/supabaseServerOnly';

export async function GET(req: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const authClient = createServerAuthClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Use admin client for data access
    const supabase = createAdminClient();

    // Find the parent record using user_id
    const { data: parent, error: parentError } = await supabase
      .from('parents')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (parentError || !parent) {
      console.error('Parent not found:', parentError);
      return NextResponse.json({ error: 'Parent record not found' }, { status: 404 });
    }

    return NextResponse.json({ parentId: parent.id });

  } catch (error) {
    console.error('Error in get-parent-id API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
