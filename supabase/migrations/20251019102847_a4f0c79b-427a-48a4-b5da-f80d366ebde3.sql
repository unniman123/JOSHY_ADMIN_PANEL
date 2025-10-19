-- Create ENUM for day out inquiry status
CREATE TYPE day_out_inquiry_status AS ENUM ('new', 'contacted', 'closed');

-- Create ENUM for contact inquiry status
CREATE TYPE contact_inquiry_status AS ENUM ('new', 'responded', 'archived');

-- Create ENUM for parent categories
CREATE TYPE parent_category_type AS ENUM ('Kerala Travel', 'Discover India', 'Global Holiday');

-- Create day_out_inquiry table
CREATE TABLE public.day_out_inquiry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  mobile_no TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  number_of_people INTEGER NOT NULL,
  destination TEXT,
  special_comments TEXT,
  status day_out_inquiry_status NOT NULL DEFAULT 'new',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create contact_inquiry table
CREATE TABLE public.contact_inquiry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status contact_inquiry_status NOT NULL DEFAULT 'new',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create site_content table
CREATE TABLE public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  element_key TEXT NOT NULL UNIQUE,
  content_value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Update categories table: Add parent_category column
ALTER TABLE public.categories 
ADD COLUMN parent_category parent_category_type;

-- Enable RLS on new tables
ALTER TABLE public.day_out_inquiry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies for day_out_inquiry
CREATE POLICY "Anyone can insert day out inquiries"
ON public.day_out_inquiry
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view all day out inquiries"
ON public.day_out_inquiry
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update day out inquiries"
ON public.day_out_inquiry
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete day out inquiries"
ON public.day_out_inquiry
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for contact_inquiry
CREATE POLICY "Anyone can insert contact inquiries"
ON public.contact_inquiry
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view all contact inquiries"
ON public.contact_inquiry
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update contact inquiries"
ON public.contact_inquiry
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete contact inquiries"
ON public.contact_inquiry
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for site_content
CREATE POLICY "Anyone can view site content"
ON public.site_content
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can insert site content"
ON public.site_content
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site content"
ON public.site_content
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site content"
ON public.site_content
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Create indexes for better query performance
CREATE INDEX idx_day_out_inquiry_status ON public.day_out_inquiry(status);
CREATE INDEX idx_day_out_inquiry_submitted_at ON public.day_out_inquiry(submitted_at DESC);
CREATE INDEX idx_contact_inquiry_status ON public.contact_inquiry(status);
CREATE INDEX idx_contact_inquiry_submitted_at ON public.contact_inquiry(submitted_at DESC);
CREATE INDEX idx_site_content_element_key ON public.site_content(element_key);

-- Insert default homepage hero banner content
INSERT INTO public.site_content (element_key, content_value)
VALUES (
  'homepage_hero_banner',
  '{"image_url": "", "title": "Welcome to Kerala", "subtitle": "Experience Paradise"}'::jsonb
)
ON CONFLICT (element_key) DO NOTHING;