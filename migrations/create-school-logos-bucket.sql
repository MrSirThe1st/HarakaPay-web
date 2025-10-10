-- Create school-logos bucket for storing school logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'school-logos',
  'school-logos', 
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
);

-- Create RLS policies for the bucket
-- Allow authenticated users to upload logos for their school
CREATE POLICY "Users can upload logos for their school" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'school-logos' AND
  auth.role() = 'authenticated' AND
  -- Check if user belongs to the school
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND school_id::text = (storage.foldername(name))[1]
  )
);

-- Allow authenticated users to update logos for their school
CREATE POLICY "Users can update logos for their school" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'school-logos' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND school_id::text = (storage.foldername(name))[1]
  )
);

-- Allow authenticated users to delete logos for their school
CREATE POLICY "Users can delete logos for their school" ON storage.objects
FOR DELETE USING (
  bucket_id = 'school-logos' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND school_id::text = (storage.foldername(name))[1]
  )
);

-- Allow public read access to logos (since bucket is public)
CREATE POLICY "Public can view logos" ON storage.objects
FOR SELECT USING (bucket_id = 'school-logos');
