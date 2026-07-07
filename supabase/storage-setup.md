# Supabase Storage Setup Guide

## Create product-images bucket

### Option 1: Via Supabase Dashboard
1. Go to https://app.supabase.com/project/YOUR_PROJECT_ID/storage
2. Click "New bucket"
3. Name: `product-images`
4. Public bucket: ✅ (enabled)
5. File size limit: 5MB
6. Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

### Option 2: Via Supabase CLI
```bash
supabase storage new-buckets product-images --public
```

## Bucket Policies

### Public Read Policy
```sql
-- Allow public read access to product-images
CREATE POLICY "Public read product-images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'product-images');
```

### Service Role Write Policy
```sql
-- Allow service role to write to product-images
CREATE POLICY "Service role write product-images"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Service role update product-images"
ON storage.objects FOR UPDATE
TO service_role
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Service role delete product-images"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'product-images');
```

## Folder Structure
- `products/` - Main product images
- `categories/` - Category images
- `deals/` - Deal images
- `heroes/` - Hero section images
