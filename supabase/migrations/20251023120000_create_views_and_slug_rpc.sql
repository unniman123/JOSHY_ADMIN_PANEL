-- Migration: Create published tour views and slug availability helper

-- 1) Drop existing views if they exist to avoid conflicts during re-run
DROP VIEW IF EXISTS public.vw_tour_by_slug;
DROP VIEW IF EXISTS public.vw_published_tours;

-- 2) View exposing published tours for the public website
CREATE VIEW public.vw_published_tours AS
SELECT
  t.id,
  t.title,
  t.slug,
  t.short_description,
  t.featured_image_url,
  t.price,
  t.duration_days,
  t.display_order,
  COALESCE(t.is_featured, false) AS is_featured,
  COALESCE(t.is_day_out_package, false) AS is_day_out_package,
  COALESCE(t.rating, 0)::numeric(2,1) AS rating,
  COALESCE(t.review_count, 0) AS review_count,
  t.location,
  t.category_id,
  c.name AS category_name,
  c.slug AS category_slug,
  COALESCE(
    (
      SELECT jsonb_agg(jsonb_build_object(
        'id', img.id,
        'url', img.image_url,
        'caption', img.caption,
        'order', img.display_order,
        'section', img.section,
        'alt', img.alt_text
      ) ORDER BY img.display_order)
      FROM public.tour_images img
      WHERE img.tour_id = t.id
        AND COALESCE(img.is_active, true)
    ), '[]'::jsonb
  ) AS images
FROM public.tours t
LEFT JOIN public.categories c ON c.id = t.category_id
WHERE t.is_published = true
  AND COALESCE(t.status, 'draft'::public.tour_status) <> 'archived';

COMMENT ON VIEW public.vw_published_tours IS 'Published tours with category and gallery metadata for website consumption';

-- 3) View exposing full tour detail (sections, gallery, metadata)
CREATE VIEW public.vw_tour_by_slug AS
SELECT
  t.id,
  t.slug,
  t.title,
  t.short_description,
  t.description,
  t.price,
  t.duration_days,
  t.display_order,
  COALESCE(t.is_featured, false) AS is_featured,
  COALESCE(t.is_day_out_package, false) AS is_day_out_package,
  COALESCE(t.is_published, false) AS is_published,
  COALESCE(t.rating, 0)::numeric(2,1) AS rating,
  COALESCE(t.review_count, 0) AS review_count,
  t.location,
  t.category_id,
  c.name AS category_name,
  c.slug AS category_slug,
  t.featured_image_url,
  COALESCE(
    (
      SELECT jsonb_agg(jsonb_build_object(
        'id', img.id,
        'url', img.image_url,
        'caption', img.caption,
        'order', img.display_order,
        'section', img.section,
        'alt', img.alt_text,
        'isActive', img.is_active
      ) ORDER BY img.display_order)
      FROM public.tour_images img
      WHERE img.tour_id = t.id
        AND COALESCE(img.is_active, true)
    ), '[]'::jsonb
  ) AS images,
  COALESCE(
    (
      SELECT jsonb_agg(jsonb_build_object(
        'id', sec.id,
        'type', sec.type,
        'title', sec.title,
        'content', sec.content,
        'order', sec."order",
        'isVisible', sec.is_visible
      ) ORDER BY sec."order")
      FROM public.tour_sections sec
      WHERE sec.tour_id = t.id
        AND COALESCE(sec.is_visible, true)
    ), '[]'::jsonb
  ) AS sections,
  COALESCE(t.overview, (
    SELECT sec.content
    FROM public.tour_sections sec
    WHERE sec.tour_id = t.id
      AND sec.type = 'overview'
    ORDER BY sec."order"
    LIMIT 1
  )) AS overview_content,
  COALESCE(t.itinerary, '[]'::jsonb) AS itinerary
FROM public.tours t
LEFT JOIN public.categories c ON c.id = t.category_id
WHERE COALESCE(t.status, 'draft'::public.tour_status) <> 'archived'
  AND COALESCE(t.is_published, false) = true;

COMMENT ON VIEW public.vw_tour_by_slug IS 'Detailed published tour payload including sections and gallery for slug-based lookups';

-- 4) Ensure anonymous and authenticated clients can read the views
GRANT SELECT ON public.vw_published_tours TO anon, authenticated;
GRANT SELECT ON public.vw_tour_by_slug TO anon, authenticated;

-- 5) Helper function to check slug availability (case-insensitive)
CREATE OR REPLACE FUNCTION public.check_tour_slug_available(p_slug text, p_tour_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.tours t
    WHERE lower(t.slug) = lower(p_slug)
      AND (p_tour_id IS NULL OR t.id <> p_tour_id)
  );
$$;

COMMENT ON FUNCTION public.check_tour_slug_available(text, uuid) IS 'Returns true when slug is unused (excluding optional tour id)';

GRANT EXECUTE ON FUNCTION public.check_tour_slug_available(text, uuid) TO authenticated;



