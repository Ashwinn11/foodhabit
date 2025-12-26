-- Storage bucket policies for scan-images
-- Allow authenticated users to upload to their own folder

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'scan-images',
  'scan-images',
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- RLS Policy for uploads
CREATE POLICY "Users can upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'scan-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS Policy for reading
CREATE POLICY "Users can read own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'scan-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS Policy for updates
CREATE POLICY "Users can update own files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'scan-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS Policy for deletion
CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'scan-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );