// src/app/api/school/receipt-logo-upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabaseServerOnly';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile using admin client
    const adminClient = createAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    // Check if user has school-level access
    if (!(profile as any).school_id || !['school_admin', 'school_staff'].includes((profile as any).role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid file type. Only JPEG, PNG, WebP, GIF, and SVG images are allowed.' 
      }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: 'File too large. Maximum size is 5MB.' 
      }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${(profile as any).school_id}/receipt-logos/${timestamp}-${randomString}.${fileExtension}`;

    // Upload file to Supabase storage using admin client to bypass RLS
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from('school-logos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL using admin client
    const { data: urlData } = adminClient.storage
      .from('school-logos')
      .getPublicUrl(fileName);

    // Update the school's logo_url in the database with the full public URL
    const { error: updateError } = await adminClient
      .from('schools')
      .update({ logo_url: urlData.publicUrl })
      .eq('id', profile.school_id);

    if (updateError) {
      console.error('Error updating school logo_url:', updateError);
      // Don't fail the request, but log the error
    }

    const response = {
      success: true,
      data: {
        fileName: uploadData.path,
        logo_url: urlData.publicUrl,
      },
      message: 'Logo uploaded successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in logo upload:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile using admin client
    const adminClient = createAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    // Check if user has school-level access
    if (!(profile as any).school_id || !['school_admin', 'school_staff'].includes((profile as any).role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const { fileName } = await request.json();
    
    if (!fileName) {
      return NextResponse.json({ success: false, error: 'File name is required' }, { status: 400 });
    }

    // Verify the file belongs to the school
    if (!fileName.startsWith(`${(profile as any).school_id}/`)) {
      return NextResponse.json({ success: false, error: 'Unauthorized file access' }, { status: 403 });
    }

    // Delete file from storage using admin client
    const { error: deleteError } = await adminClient.storage
      .from('school-logos')
      .remove([fileName]);

    if (deleteError) {
      console.error('Error deleting file:', deleteError);
      return NextResponse.json({ success: false, error: 'Failed to delete file' }, { status: 500 });
    }

    // Remove the logo_url from the school's database record
    const { error: updateError } = await adminClient
      .from('schools')
      .update({ logo_url: null })
      .eq('id', profile.school_id);

    if (updateError) {
      console.error('Error removing logo_url from database:', updateError);
      // Don't fail the request, but log the error
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Logo deleted successfully' 
    });
  } catch (error) {
    console.error('Error in logo delete:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}