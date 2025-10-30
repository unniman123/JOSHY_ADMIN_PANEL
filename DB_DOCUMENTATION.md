Supabase Database — Full Reference & Cookbook
==========================================

Purpose
-------
This document fully describes the Supabase database schema, RLS policies, storage buckets, views, RPCs, migration history, and operational commands needed to operate, maintain, and integrate the database with the admin panel and the website. Treat this as the canonical reference for DB-level operations.

Table of contents
-----------------
1. Schema overview (tables & columns)
2. Enumerated RLS policies and intent
3. Storage buckets & policies
4. Views & RPCs (detailed)
5. Migrations applied (list)
6. Backfills and data-migration scripts
7. Indexes & performance recommendations
8. Safety & rollback procedures
9. Common operational commands
10. Verifications & QA steps

1) Schema overview — tables & key columns
-----------------------------------------
All tables live in the `public` schema unless noted.

- `public.tours`
  - id UUID (PK, gen_random_uuid())
  - title TEXT NOT NULL
  - slug TEXT NOT NULL (unique constraint + CI index)
  - description TEXT
  - short_description TEXT
  - category_id UUID REFERENCES public.categories(id)
  - price NUMERIC(10,2)
  - duration_days INTEGER
  - max_group_size INTEGER
  - difficulty_level TEXT
  - featured_image_url TEXT
  - status tour_status ENUM ('draft','published','archived')
  - meta_title TEXT, meta_description TEXT
  - created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
  - updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
  - created_by UUID REFERENCES auth.users(id)
  - overview JSONB
  - image_gallery_urls JSONB
  - itinerary JSONB
  - is_featured BOOLEAN
  - is_day_out_package BOOLEAN
  - is_published BOOLEAN
  - display_order INTEGER DEFAULT 999
  - rating NUMERIC(2,1)
  - review_count INTEGER DEFAULT 0
  - location TEXT

- `public.tour_images`
  - id UUID PK
  - tour_id UUID REFERENCES public.tours(id)
  - image_url TEXT
  - caption TEXT
  - display_order INTEGER
  - created_at TIMESTAMPTZ
  - section TEXT DEFAULT 'gallery'
  - alt_text TEXT
  - is_active BOOLEAN DEFAULT true

- `public.tour_sections`
  - id UUID PK
  - tour_id UUID REFERENCES public.tours(id)
  - type TEXT NOT NULL (e.g., 'overview','itinerary','gallery')
  - title TEXT
  - content JSONB
  - order INTEGER DEFAULT 999
  - is_visible BOOLEAN DEFAULT true
  - created_at/updated_at
  - created_by UUID REFERENCES auth.users(id)

- `public.categories` — id, name, slug, parent_id, image_url, display_order, is_active
- `public.inquiries` — tour_id, name, email, contact_number, message, status, admin_notes, travel details
- `public.day_out_inquiry` — package_id, name, mobile_no, preferred_date, number_of_people, status
- `public.contact_inquiry` — simple contact form
- `public.site_content` — key-value content JSONB
- `public.homepage_settings` — single-row hero & featured tour references
- `public.user_roles` — user_id -> role (app_role enum)

2) Row Level Security (RLS) — policies & rationale
--------------------------------------------------
RLS is required to protect data when using anon keys in frontend. Key policies:

- Tours: `Anyone can view published tours` — SELECT allowed when `is_published=true` OR user is admin. Admins have full CRUD.
- Tour images: public SELECT allowed for `is_active=true`. Admins can manage all image rows.
- Inquiries: anon can INSERT (to allow public contact forms). Admins can SELECT/UPDATE/DELETE inquiries.
- Categories & site content: anon SELECT allowed; admins can modify.
- User roles: only admins can insert/delete. Users can select their own roles.

Rationale: Allow public website usage with anon key while preventing unauthorized writes/reads of admin-only data.

3) Storage buckets & storage policies
------------------------------------
- Buckets: `tour-images`, `category-images`, `homepage-images` (all public read)
- Storage policy highlights:
  - Public SELECT on `storage.objects` restricted to known buckets.
  - Admin-only INSERT/DELETE guarded by `public.has_role(auth.uid(), 'admin')`.

4) Views & RPCs (detailed)
--------------------------
- `vw_published_tours` (SELECT): columns: id, title, slug, short_description, featured_image_url, price, duration_days, display_order, is_featured, is_day_out_package, rating, review_count, location, category_id, category_name, category_slug, images (JSON array aggregated from `tour_images`).
  - Use: listings, featured sections, feeds.

- `vw_tour_by_slug` (SELECT): full details including `sections` (aggregated `tour_sections` rows), `images`, `overview_content` (first overview section if present), `itinerary`.
  - Use: detail page.

- `check_tour_slug_available(p_slug text, p_tour_id uuid)` (RPC): case-insensitive availability check; returns boolean.

5) Migrations applied (summary)
--------------------------------
- Base schema & enums: 20251015180108
- Tours extras: 20251017150651 (overview, image_gallery_urls, itinerary, is_published, display_order)
- Day out / contact and site_content: 20251019102847
- inquiries extras: 20251019105322
- tour_sections & image enhancements: 20251022123000_add_tour_sections_and_fields
- views & slug rpc: 20251023120000_create_views_and_slug_rpc
- CI slug index: 20251024120000_add_ci_slug_index
- RLS verification script: 20251024121000_rls_verification

6) Backfills & migrations (how to run safely)
--------------------------------------------
- BACKFILL tour_images from tours.image_gallery_urls (idempotent):
  ```sql
  INSERT INTO public.tour_images (tour_id, image_url, display_order, section)
  SELECT t.id, (img->>'url')::text, COALESCE((img->>'order')::int, row_number() OVER (PARTITION BY t.id ORDER BY t.id)), COALESCE(img->>'section','gallery')
  FROM public.tours t,
  LATERAL jsonb_array_elements(t.image_gallery_urls) img
  WHERE t.image_gallery_urls IS NOT NULL
  ON CONFLICT DO NOTHING;
  ```

- Add CI unique index on slug:
  ```sql
  CREATE UNIQUE INDEX IF NOT EXISTS idx_tours_slug_ci ON public.tours (lower(slug));
  ```

Run these on staging first. For the CI index, ensure no duplicates returned by:
  ```sql
  SELECT lower(slug) AS s, count(*) FROM public.tours GROUP BY lower(slug) HAVING count(*) > 1;
  ```

7) Indexes & performance recommendations
----------------------------------------
- Indexes added: `idx_tours_category_id`, `idx_tours_is_published`, `idx_tours_display_order`, `idx_tour_images_section`, `idx_inquiries_submitted_at`.
- Recommendation: Add `pg_trgm` and full-text search indexes if site search is required. Consider materialized views for heavy aggregations.

8) Safety & rollback procedures
--------------------------------
- Always run migrations in staging first. Create a DB snapshot or pg_dump before production migrations.
- Keep migration changes small and reversible (provide DROP statements or reversal migration files).

9) Common operational commands
-----------------------------
- List migrations:
  ```sql
  SELECT version, name FROM supabase_migrations.schema_migrations ORDER BY version;
  ```
- Show applied indexes:
  ```sql
  SELECT indexname, indexdef FROM pg_indexes WHERE schemaname='public' AND tablename='tours';
  ```

10) Verifications & QA steps (quick)
-----------------------------------
1. Insert a published tour as admin; verify it shows in `vw_published_tours` when queried with anon key.
2. Upload image to `tour-images/{tourId}` and ensure `tour_images` row points to the public URL and that image renders in frontend.
3. Test `check_tour_slug_available` RPC by calling with known slug and asserting result.
4. Attempt anon write to `public.tours` — should be denied.

Appendix: Examples — scripts and sample fetch code
-------------------------------------------------
- See `ADMIN_MANUAL.md` for website fetch examples using `@supabase/supabase-js`.

Contact
-------
For operational changes to production DB, create a staging snapshot and test there. Maintain this file under version control and update when migrations are added.




