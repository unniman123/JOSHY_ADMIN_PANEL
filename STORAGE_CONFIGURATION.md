# Storage Bucket Configuration Documentation

## Overview
This document describes the storage bucket configuration for the Truth Teller Admin Panel, including file size limits and MIME type restrictions implemented to ensure security and optimal performance.

## Configuration Summary

### Applied Restrictions
- **File Size Limit**: 10 MB (10,485,760 bytes)
- **Allowed MIME Types**: 
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
  - `image/webp`

### Configured Buckets

| Bucket Name | Public Access | File Size Limit | MIME Types | Status |
|-------------|---------------|-----------------|------------|--------|
| tour-images | ✓ Yes | 10 MB | JPEG, JPG, PNG, WebP | ✓ Configured |
| category-images | ✓ Yes | 10 MB | JPEG, JPG, PNG, WebP | ✓ Configured |
| homepage-images | ✓ Yes | 10 MB | JPEG, JPG, PNG, WebP | ✓ Configured |

## Implementation Details

### 1. Database-Level Restrictions (Server-Side)

**Migration Applied**: `20251027000000_configure_storage_bucket_restrictions.sql`

Storage buckets are configured at the database level with:
```sql
UPDATE storage.buckets
SET 
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
WHERE id IN ('tour-images', 'category-images', 'homepage-images');
```

**Enforcement**: Supabase Storage API automatically validates uploads against these restrictions and rejects non-compliant files.

---

### 2. Client-Side Validation (User Experience)

#### ImageUpload Component
**Location**: `src/components/admin/ImageUpload.tsx`

**File Size Validation** (Lines 35-43):
```typescript
if (file.size > 10 * 1024 * 1024) {
  toast({
    title: 'Error',
    description: 'File must be under 10MB',
    variant: 'destructive',
  });
  return;
}
```

**MIME Type Validation** (Lines 45-54):
```typescript
const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
if (!allowedTypes.includes(file.type.toLowerCase())) {
  toast({
    title: 'Error',
    description: 'Only JPEG, PNG, and WebP images are allowed',
    variant: 'destructive',
  });
  return;
}
```

**File Input Restriction** (Line 117):
```typescript
<Input
  type="file"
  accept="image/jpeg,image/jpg,image/png,image/webp"
  onChange={handleFileUpload}
/>
```

---

#### ImageGallery Component
**Location**: `src/components/admin/ImageGallery.tsx`

**File Size Validation** (Lines 29-36):
```typescript
if (file.size > 10 * 1024 * 1024) {
  toast({
    title: 'Error',
    description: 'File must be under 10MB',
    variant: 'destructive',
  });
  return;
}
```

**MIME Type Validation** (Lines 38-47):
```typescript
const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
if (!allowedTypes.includes(file.type.toLowerCase())) {
  toast({
    title: 'Error',
    description: 'Only JPEG, PNG, and WebP images are allowed',
    variant: 'destructive',
  });
  return;
}
```

**File Input Restriction** (Line 174):
```typescript
<Input
  type="file"
  accept="image/jpeg,image/jpg,image/png,image/webp"
  onChange={handleFileUpload}
/>
```

---

## Security Benefits

### 1. File Size Limit (10 MB)
- **Prevents Storage Abuse**: Blocks excessively large files that could consume storage quota
- **Performance Optimization**: Ensures fast upload/download times
- **Cost Control**: Limits storage and bandwidth costs
- **DoS Prevention**: Mitigates potential denial-of-service attacks via large file uploads

### 2. MIME Type Restrictions
- **Prevents Malicious Uploads**: Blocks executable files, scripts, and other non-image formats
- **Ensures Data Integrity**: Guarantees only valid image files are stored
- **Reduces Attack Surface**: Eliminates potential for file-based exploits
- **Improves User Experience**: Ensures consistent rendering across browsers

### 3. Dual-Layer Validation
- **Client-Side**: Provides immediate feedback to users before upload
- **Server-Side**: Enforces restrictions even if client validation is bypassed
- **Defense in Depth**: Multiple layers of protection against malicious uploads

---

## Verification Commands

### Check Bucket Configuration
```sql
SELECT 
  id AS bucket_name,
  public AS is_public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id IN ('tour-images', 'category-images', 'homepage-images');
```

### Expected Result
```json
[
  {
    "bucket_name": "tour-images",
    "is_public": true,
    "file_size_limit": 10485760,
    "allowed_mime_types": ["image/jpeg", "image/jpg", "image/png", "image/webp"]
  },
  {
    "bucket_name": "category-images",
    "is_public": true,
    "file_size_limit": 10485760,
    "allowed_mime_types": ["image/jpeg", "image/jpg", "image/png", "image/webp"]
  },
  {
    "bucket_name": "homepage-images",
    "is_public": true,
    "file_size_limit": 10485760,
    "allowed_mime_types": ["image/jpeg", "image/jpg", "image/png", "image/webp"]
  }
]
```

---

## Testing Procedures

### Manual Testing Checklist

**File Size Validation:**
- [ ] Upload image < 10 MB → Should succeed
- [ ] Upload image = 10 MB → Should succeed
- [ ] Upload image > 10 MB → Should fail with error message

**MIME Type Validation:**
- [ ] Upload JPEG image → Should succeed
- [ ] Upload PNG image → Should succeed
- [ ] Upload WebP image → Should succeed
- [ ] Upload GIF image → Should fail with error message
- [ ] Upload PDF file → Should fail with error message
- [ ] Upload TXT file → Should fail with error message

**Client-Side Validation:**
- [ ] File picker only shows image files (due to `accept` attribute)
- [ ] Error toast appears immediately when invalid file selected
- [ ] No upload attempt made to server for invalid files

**Server-Side Validation:**
- [ ] API rejects files > 10 MB even if client validation bypassed
- [ ] API rejects non-image MIME types even if client validation bypassed

---

## Troubleshooting

### Issue: "File must be under 10MB" Error
**Cause**: Selected file exceeds 10 MB limit  
**Solution**: Compress image using tools like TinyPNG, ImageOptim, or similar  
**Recommended**: Use WebP format for optimal compression

### Issue: "Only JPEG, PNG, and WebP images are allowed" Error
**Cause**: Selected file is not a supported image format  
**Solution**: Convert image to JPEG, PNG, or WebP format  
**Tools**: Online converters like CloudConvert, or image editing software

### Issue: Upload Succeeds But Image Not Visible
**Cause**: Image URL may not be properly saved or bucket policy issue  
**Solution**: 
1. Verify bucket is public (`is_public = true`)
2. Check RLS policies allow public read access
3. Verify image URL is correctly stored in database

---

## Compliance

### PRD Requirements
- ✅ File size limit: 10 MB (as per PRD specification)
- ✅ Allowed MIME types: JPEG, PNG, WebP (as per PRD specification)
- ✅ Client-side validation for better UX
- ✅ Server-side enforcement for security

### Security Best Practices
- ✅ Defense in depth (client + server validation)
- ✅ Least privilege (only allowed MIME types)
- ✅ Resource limits (file size cap)
- ✅ Fail-secure design (rejects by default)

---

## Maintenance

### Future Enhancements
1. **Image Optimization Pipeline**: Automatic compression and resizing on upload
2. **Format Conversion**: Auto-convert uploaded images to WebP for better compression
3. **CDN Integration**: Serve images through CDN for improved performance
4. **Thumbnail Generation**: Auto-generate thumbnails for gallery views
5. **Malware Scanning**: Integrate antivirus scanning for uploaded files

### Monitoring
- Track upload success/failure rates
- Monitor storage usage trends
- Alert on unusual upload patterns
- Review rejected uploads periodically

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-10-27 | 1.0 | Initial configuration with 10MB limit and MIME type restrictions | System |

---

**Last Updated**: October 27, 2025  
**Configuration Status**: ✓ Active and Enforced  
**Next Review**: Quarterly or upon security policy changes


