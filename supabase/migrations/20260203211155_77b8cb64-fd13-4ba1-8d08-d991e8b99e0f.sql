-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false);

-- Policy to allow authenticated users to upload their own resumes
CREATE POLICY "Users can upload their own resumes"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow authenticated users to read their own resumes
CREATE POLICY "Users can read their own resumes"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow service role to read all resumes (for HR/OCR processing)
CREATE POLICY "Service role can read all resumes"
ON storage.objects
FOR SELECT
TO service_role
USING (bucket_id = 'resumes');