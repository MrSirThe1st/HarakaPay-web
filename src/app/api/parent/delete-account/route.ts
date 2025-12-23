import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseServerOnly';

// Force dynamic rendering (required for Next.js 16+)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    const supabase = createAdminClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // Find parent record
    const { data: parent, error: parentError } = await adminClient
      .from('parents')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (parentError || !parent) {
      return NextResponse.json({
        error: 'Parent record not found',
        details: 'No parent record exists for this user'
      }, { status: 404 });
    }

    interface Parent {
      id: string;
    }

    const typedParent = parent as Parent;

    // Delete parent-student relationships
    const { error: linkDeleteError } = await adminClient
      .from('parent_students')
      .delete()
      .eq('parent_id', typedParent.id);

    if (linkDeleteError) {
      console.error('Error deleting parent-student links:', linkDeleteError);
      // Continue anyway - may not have any links
    }

    // Delete parent record
    const { error: parentDeleteError } = await adminClient
      .from('parents')
      .delete()
      .eq('id', typedParent.id);

    if (parentDeleteError) {
      console.error('Error deleting parent record:', parentDeleteError);
      return NextResponse.json({
        error: 'Failed to delete parent record',
        details: parentDeleteError.message
      }, { status: 500 });
    }

    // Delete profile record
    const { error: profileDeleteError } = await adminClient
      .from('profiles')
      .delete()
      .eq('user_id', user.id);

    if (profileDeleteError) {
      console.error('Error deleting profile:', profileDeleteError);
      // Don't fail if profile doesn't exist
    }

    // Delete Supabase auth user (hard delete)
    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(user.id);

    if (deleteUserError) {
      console.error('Error deleting auth user:', deleteUserError);
      return NextResponse.json({
        error: 'Failed to delete user account',
        details: deleteUserError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Account successfully deleted'
    });

  } catch (error) {
    console.error('Error in delete-account API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
