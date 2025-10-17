-- Add missing fields to tours table to match PRD requirements
ALTER TABLE public.tours
ADD COLUMN IF NOT EXISTS overview JSONB,
ADD COLUMN IF NOT EXISTS image_gallery_urls JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS itinerary JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_day_out_package BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 999;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_tours_is_featured ON public.tours(is_featured);
CREATE INDEX IF NOT EXISTS idx_tours_is_day_out_package ON public.tours(is_day_out_package);
CREATE INDEX IF NOT EXISTS idx_tours_display_order ON public.tours(display_order);
CREATE INDEX IF NOT EXISTS idx_tours_is_published ON public.tours(is_published);

-- Update RLS policy to use is_published for public access
DROP POLICY IF EXISTS "Anyone can view published tours" ON public.tours;
CREATE POLICY "Anyone can view published tours" ON public.tours
  FOR SELECT
  USING ((is_published = true) OR has_role(auth.uid(), 'admin'::app_role));

COMMENT ON COLUMN public.tours.overview IS 'Rich text content stored as JSONB (Slate.js/TipTap format)';
COMMENT ON COLUMN public.tours.image_gallery_urls IS 'Array of image objects with url and order fields';
COMMENT ON COLUMN public.tours.itinerary IS 'Array of day objects with day number, title, and description';
COMMENT ON COLUMN public.tours.is_featured IS 'Shows on TourOffersSection (homepage)';
COMMENT ON COLUMN public.tours.is_day_out_package IS 'Shows on DayOutPackagesSection';
COMMENT ON COLUMN public.tours.display_order IS 'Controls ordering in frontend sections (lower = appears first)';
COMMENT ON COLUMN public.tours.is_published IS 'Draft vs Live - only published tours visible on website';