-- Create bucket for chart files
INSERT INTO storage.buckets (id, name, public)
VALUES ('chart-files', 'chart-files', true);

-- Allow public access to chart files
CREATE POLICY "Public chart files access" ON storage.objects
FOR SELECT USING (bucket_id = 'chart-files');

-- Allow authenticated users to upload chart files
CREATE POLICY "Authenticated users can upload chart files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'chart-files' AND 
  auth.role() = 'authenticated'
);

-- Allow users to manage their own chart files
CREATE POLICY "Users can manage own chart files" ON storage.objects
FOR ALL USING (
  bucket_id = 'chart-files' AND 
  auth.role() = 'authenticated'
);
