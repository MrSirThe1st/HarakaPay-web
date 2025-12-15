// src/app/api/school/store/image-upload/route.ts
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

    interface Profile {
      school_id: string | null;
      role: string;
      [key: string]: unknown;
    }
    const typedProfile = profile as Profile | null;

    if (profileError || !typedProfile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    // Check if user has school-level access
    if (!typedProfile.school_id || !['school_admin', 'school_staff'].includes(typedProfile.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' 
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
    const fileName = `${typedProfile.school_id}/${timestamp}-${randomString}.${fileExtension}`;

    // Upload file to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('store-item-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('store-item-images')
      .getPublicUrl(fileName);

    const response = {
      success: true,
      data: {
        fileName: uploadData.path,
        url: urlData.publicUrl,
      },
      message: 'File uploaded successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in image upload:', error);
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

    interface Profile {
      school_id: string | null;
      role: string;
      [key: string]: unknown;
    }
    const typedProfile = profile as Profile | null;

    if (profileError || !typedProfile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    // Check if user has school-level access
    if (!typedProfile.school_id || !['school_admin', 'school_staff'].includes(typedProfile.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { fileName } = body;

    if (!fileName) {
      return NextResponse.json({ success: false, error: 'File name is required' }, { status: 400 });
    }

    // Verify file belongs to school (starts with school_id)
    if (!fileName.startsWith(typedProfile.school_id + '/')) {
      return NextResponse.json({ success: false, error: 'Unauthorized to delete this file' }, { status: 403 });
    }

    // Delete file from storage
    const { error: deleteError } = await supabase.storage
      .from('store-item-images')
      .remove([fileName]);

    if (deleteError) {
      console.error('Error deleting file:', deleteError);
      return NextResponse.json({ success: false, error: 'Failed to delete file' }, { status: 500 });
    }

    const response = {
      success: true,
      data: null,
      message: 'File deleted successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in image delete:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
