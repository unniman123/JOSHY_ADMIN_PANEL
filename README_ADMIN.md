Admin Panel — Quick Ops & Integration Notes
=========================================

This document summarizes the admin panel flows, Supabase artifacts (tables, views, storage paths), and quick commands to operate and onboard admins.

1) Key Supabase tables (canonical)
- `tours` — primary tour rows (title, slug, overview, meta, featured_image_url, price, duration_days, is_published, display_order, rating, review_count, location)
- `tour_images` — canonical image storage metadata (tour_id, image_url, caption, display_order, section, alt_text, is_active)
- `tour_sections` — ordered content sections for each tour (overview, itinerary, gallery, custom)
- `categories` — tour categories
- `inquiries` / `day_out_inquiry` / `contact_inquiry` — user-submitted forms
- `user_roles` — admin role assignments
- `homepage_settings` / `site_content` — single-row site content

2) Storage buckets & paths
- Buckets (public): `tour-images`, `category-images`, `homepage-images`
- Recommended path pattern: `tour-images/{tour-id}/{filename}` (server-first upload)

3) Views & RPCs for website consumption
- `vw_published_tours` — public-friendly list of published tours (includes aggregated `images` JSON)
- `vw_tour_by_slug` — detailed tour payload (sections + images)
- `check_tour_slug_available(p_slug text, p_tour_id uuid)` — returns boolean for slug availability

4) Quick SQL snippets
- Assign admin role (run after creating auth user via Supabase UI):
  ```sql
  INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'admin' FROM auth.users WHERE email = 'gokulravindran08@gmail.com'
  ON CONFLICT (user_id, role) DO NOTHING;
  ```

- Case-insensitive slug uniqueness index (recommended):
  ```sql
  CREATE UNIQUE INDEX IF NOT EXISTS idx_tours_slug_ci ON public.tours (lower(slug));
  ```

- Backfill `tour_images` from `tours.image_gallery_urls` (example):
  ```sql
  -- Run on staging first
  INSERT INTO public.tour_images (tour_id, image_url, display_order, section)
  SELECT id, (img->>'url')::text, (img->>'order')::int, COALESCE(img->>'section','gallery')
  FROM public.tours, jsonb_array_elements(image_gallery_urls) img
  WHERE image_gallery_urls IS NOT NULL;
  ```

5) Admin panel developer notes
- Tour creation flow: server-first (create draft tour → upload images under `{tourId}` → edit and publish)
- Rich text: TipTap editor in admin outputs HTML stored in `tour_sections.content.html` for `overview`.
- Slug validation: admin UI calls `check_tour_slug_available` before saving; DB-level unique index recommended to prevent races.

6) How the website should consume data (summary)
- Use `vw_published_tours` for listing pages (filters by `is_published` and aggregates images).
- Use `vw_tour_by_slug` for detail page (sections + images + metadata).
- Submit inquiry forms directly into `inquiries`, `day_out_inquiry`, `contact_inquiry` tables via anon key + RLS rules allowing inserts.

7) Troubleshooting
- If images are not visible, confirm the storage public policy and that `is_active` is true on `tour_images` rows.
- If a published tour doesn't show up, confirm `is_published=true` and `status <> 'archived'`, and check that `vw_published_tours` is up-to-date.

8) Next steps for DB completion
- Add case-insensitive unique index for `slug`.
- Backfill legacy JSON fields into normalized tables.
- Run RLS verification tests using anon key and admin key.

Contact
- For any operational actions (running SQL on production), please create a staging snapshot and run the migration there first.




