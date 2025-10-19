-- Add missing fields to inquiries table to match PRD TourInquiry model
ALTER TABLE public.inquiries
ADD COLUMN IF NOT EXISTS nationality TEXT,
ADD COLUMN IF NOT EXISTS date_of_travel DATE,
ADD COLUMN IF NOT EXISTS number_of_people TEXT,
ADD COLUMN IF NOT EXISTS number_of_kids TEXT,
ADD COLUMN IF NOT EXISTS number_of_rooms INTEGER,
ADD COLUMN IF NOT EXISTS hotel_category TEXT CHECK (hotel_category IN ('3-star', '4-star', '5-star'));

-- Rename phone to contact_number for consistency with PRD
ALTER TABLE public.inquiries
RENAME COLUMN phone TO contact_number;

-- Add submitted_at column (using created_at as default)
ALTER TABLE public.inquiries
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Update existing rows to have submitted_at = created_at
UPDATE public.inquiries
SET submitted_at = created_at
WHERE submitted_at IS NULL;

-- Add performance indexes for common queries
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_submitted_at ON public.inquiries(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_tour_id ON public.inquiries(tour_id);

CREATE INDEX IF NOT EXISTS idx_day_out_inquiry_status ON public.day_out_inquiry(status);
CREATE INDEX IF NOT EXISTS idx_day_out_inquiry_submitted_at ON public.day_out_inquiry(submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_inquiry_status ON public.contact_inquiry(status);
CREATE INDEX IF NOT EXISTS idx_contact_inquiry_submitted_at ON public.contact_inquiry(submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_tours_category_id ON public.tours(category_id);
CREATE INDEX IF NOT EXISTS idx_tours_is_published ON public.tours(is_published);
CREATE INDEX IF NOT EXISTS idx_tours_is_featured ON public.tours(is_featured);
CREATE INDEX IF NOT EXISTS idx_tours_display_order ON public.tours(display_order);

CREATE INDEX IF NOT EXISTS idx_categories_parent_category ON public.categories(parent_category);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON public.categories(display_order);

-- Add comment for documentation
COMMENT ON TABLE public.inquiries IS 'Tour inquiries with full PRD-compliant fields including travel details and hotel preferences';