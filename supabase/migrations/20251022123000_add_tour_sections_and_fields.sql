-- Migration: Add tour_sections table, extend tour_images and tours with recommended fields

-- 1) Create tour_sections table to model ordered, typed sections for each tour
CREATE TABLE public.tour_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT,
  content JSONB,
  "order" INTEGER DEFAULT 999,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.tour_sections ENABLE ROW LEVEL SECURITY;

-- Indexes for queries
CREATE INDEX idx_tour_sections_tour_id ON public.tour_sections(tour_id);
CREATE INDEX idx_tour_sections_order ON public.tour_sections("order");

COMMENT ON TABLE public.tour_sections IS 'Section metadata for tours (overview, itinerary, gallery, etc.) stored as ordered rows';
COMMENT ON COLUMN public.tour_sections.content IS 'Flexible JSONB content for section body (TipTap/Slate/structured content)';

-- 2) RLS: allow public selection only for sections belonging to published tours or for admins
DROP POLICY IF EXISTS "Anyone can view tour sections" ON public.tour_sections;
CREATE POLICY "Anyone can view tour sections" ON public.tour_sections
  FOR SELECT
  TO anon, authenticated
  USING (
    (
      (SELECT t.is_published FROM public.tours t WHERE t.id = public.tour_sections.tour_id) = true
    ) OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can manage tour sections" ON public.tour_sections
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- 3) Extend tour_images with section metadata and accessibility flags
ALTER TABLE public.tour_images
  ADD COLUMN IF NOT EXISTS section TEXT DEFAULT 'gallery',
  ADD COLUMN IF NOT EXISTS alt_text TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

COMMENT ON COLUMN public.tour_images.section IS 'Which tour section this image belongs to (gallery, overview, itinerary, hero, etc.)';
COMMENT ON COLUMN public.tour_images.alt_text IS 'Alt text for accessibility';
COMMENT ON COLUMN public.tour_images.is_active IS 'If false, image is hidden in UI';

-- Keep existing public select policy for images (images are public assets)
DROP POLICY IF EXISTS "Anyone can view tour images" ON public.tour_images;
CREATE POLICY "Anyone can view tour images" ON public.tour_images
  FOR SELECT
  USING (is_active = true);

-- Ensure existing admin policy is removed before creating to avoid duplicate-name error
DROP POLICY IF EXISTS "Admins can manage tour images" ON public.tour_images;
CREATE POLICY "Admins can manage tour images" ON public.tour_images
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_tour_images_section ON public.tour_images(section);


-- 4) Add rating, review_count, location to tours table (nullable / default safe)
ALTER TABLE public.tours
  ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1),
  ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS location TEXT;

COMMENT ON COLUMN public.tours.rating IS 'Average rating (scale 0.0 - 5.0) stored as numeric(2,1)';
COMMENT ON COLUMN public.tours.review_count IS 'Number of published reviews for the tour';
COMMENT ON COLUMN public.tours.location IS 'Human-readable location string for the tour (city, region)';

CREATE INDEX IF NOT EXISTS idx_tours_location ON public.tours(location);

-- 5) Ensure documentation comment on schema alignment
COMMENT ON TABLE public.tours IS 'Tours table extended to include rating, review_count and location for future features';


