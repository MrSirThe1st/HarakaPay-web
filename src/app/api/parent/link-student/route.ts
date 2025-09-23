import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createServerAuthClient } from '@/lib/supabaseServerOnly';

export async function POST(req: NextRequest) {
  try {
    const { parent_id, student_id, relationship = 'parent', is_primary = true } = await req.json();

    if (!parent_id || !student_id) {
      return NextResponse.json({ error: 'Parent ID and Student ID are required' }, { status: 400 });
    }

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

    // First, find the correct parent ID using the user_id
    console.log('🔍 Looking up parent record for user_id:', user.id);
    
    const { data: existingParent, error: parentCheckError } = await supabase
      .from('parents')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let actualParentId;

    if (parentCheckError && parentCheckError.code === 'PGRST116') {
      // Parent record doesn't exist, create it
      console.log('🔍 Parent record not found, creating one...');
      
      // Get user profile data to create parent record
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        console.error('❌ Could not find profile for parent:', profileError);
        return NextResponse.json({ error: 'Parent profile not found' }, { status: 404 });
      }

      // Create parent record
      const { data: newParent, error: createParentError } = await supabase
        .from('parents')
        .insert({
          user_id: user.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email || user.email,
          phone: profile.phone,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createParentError) {
        console.error('❌ Error creating parent record:', createParentError);
        return NextResponse.json({ error: 'Failed to create parent record' }, { status: 500 });
      }

      actualParentId = newParent.id;
      console.log('✅ Parent record created:', newParent);
    } else if (parentCheckError) {
      console.error('❌ Error checking parent record:', parentCheckError);
      return NextResponse.json({ error: 'Failed to check parent record' }, { status: 500 });
    } else {
      actualParentId = existingParent.id;
      console.log('✅ Parent record exists:', existingParent);
    }

    // Create the parent-student relationship using the correct parent ID
    console.log('🔍 Creating relationship with data:', { 
      actualParentId, 
      student_id, 
      relationship, 
      is_primary 
    });
    
    const { data, error } = await supabase
      .from('parent_students')
      .insert({
        parent_id: actualParentId,
        student_id,
        relationship,
        is_primary,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating parent-student relationship:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json({ 
        error: 'Failed to create relationship',
        details: error
      }, { status: 500 });
    }

    console.log('✅ Relationship created successfully:', data);

    return NextResponse.json({ 
      success: true, 
      relationship: data,
      message: 'Student linked successfully' 
    });

  } catch (error) {
    console.error('Error in link-student API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
