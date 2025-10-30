-- Migration: Configure storage bucket file size limits and MIME type restrictions
-- Purpose: Enforce 10MB file size limit and restrict to JPEG, PNG, WebP image types
-- As per PRD requirements and security best practices

-- 1) Update tour-images bucket with file size limit and allowed MIME types
UPDATE storage.buckets
SET 
  file_size_limit = 10485760,  -- 10MB in bytes (10 * 1024 * 1024)
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
WHERE id = 'tour-images';

-- 2) Update category-images bucket with same restrictions
UPDATE storage.buckets
SET 
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
WHERE id = 'category-images';

-- 3) Update homepage-images bucket with same restrictions
UPDATE storage.buckets
SET 
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
WHERE id = 'homepage-images';

-- 4) Add comments for documentation
COMMENT ON TABLE storage.buckets IS 'Storage buckets configured with 10MB file size limit and restricted to JPEG, PNG, WebP image formats as per security requirements';

-- 5) Verify configuration (this query can be run manually to check)
-- SELECT id, name, file_size_limit, allowed_mime_types FROM storage.buckets WHERE id IN ('tour-images', 'category-images', 'homepage-images');


