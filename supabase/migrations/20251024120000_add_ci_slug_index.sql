-- Migration: Add case-insensitive unique index on tours.slug

-- Pre-check: ensure no conflicting slugs (case-insensitive). If any exist, address them before applying.
CREATE UNIQUE INDEX IF NOT EXISTS idx_tours_slug_ci ON public.tours (lower(slug));




