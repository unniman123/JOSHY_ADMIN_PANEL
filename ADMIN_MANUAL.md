    Admin Panel & Database — Complete Cookbook
    =======================================

    Purpose
    -------
    This document is a single-stop, operational "cookbook" to run, operate and integrate the admin panel and the shared Supabase database with the public website. It is written to be actionable: copy-paste SQL commands, ready-to-run JS snippets, checklists, and safety rules.

    Read this naturally: follow the sections in order when onboarding or integrating. Key sections: Quick start, Environment, Admin flows, Database schema, Views & API, Storage, RLS & security, Cookbook (step-by-step), Troubleshooting, and Rules & operational guardrails.

    Quick summary (one line)
    ---------------------------------
    Admin manages canonical content (tours, categories, images, site content) in Supabase; website reads published content from DB views (`vw_published_tours`, `vw_tour_by_slug`) and renders it.

    Quick start — developer checklist
    ---------------------------------
    - Clone repo and install dependencies: `npm install`
    - Create a Supabase project or use existing project. Configure envs in `.env` or your host:
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY`
    - `VITE_SUPABASE_SERVICE_KEY` (for server-only operations)
    - Run local dev server: `npm run dev`
    - Create an admin auth user via Supabase Auth UI and assign `user_roles` → see "Assign admin role" below.

    Environment variables
    ---------------------
    - `VITE_SUPABASE_URL` — Supabase project URL (e.g. `https://xyz.supabase.co`)
    - `VITE_SUPABASE_ANON_KEY` — public anon key for website reads
    - `VITE_SUPABASE_SERVICE_KEY` — service key (server-only) for migrations/admin scripts

    Admin panel architecture (frameworks & files)
    --------------------------------------------
    - Frontend: React + Vite. UI components from shadcn/ui; TipTap used for rich text editing.
    - Supabase client: `src/integrations/supabase/client.ts` (reads env vars)
    - Admin pages: `src/pages/admin/*` (Tours, TourForm, Categories, Inquiries, Roles, Settings)
    - Admin components: `src/components/admin/*` (ImageUpload, ImageGallery, RichTextEditor, ItineraryBuilder)
    - Types: `src/types/database.ts` mirrors DB schema

    Primary design principles (follow these)
    -------------------------------------
    - Preserve functionality: never change critical services or config without a backup.
    - No redundancy: avoid duplicate data sources; admin is canonical.
    - Evidence-based changes: gather evidence (schema, migrations, logs) before edits.
    - Incremental changes: small, tested patches with a rollback plan.

    Database schema overview (key tables)
    -------------------------------------
    - `public.tours` — canonical tour records
    - important fields: `id`, `title`, `slug`, `short_description`, `featured_image_url`, `price`, `duration_days`, `is_published`, `display_order`, `rating`, `review_count`, `location`, `overview` (JSONB), `itinerary` (JSONB)
    - `public.tour_images` — images per tour (normalized)
    - fields: `id`, `tour_id`, `image_url`, `caption`, `display_order`, `section`, `alt_text`, `is_active`
    - `public.tour_sections` — ordered sections (overview, itinerary, gallery, custom)
    - fields: `id`, `tour_id`, `type`, `title`, `content` (JSONB), `order`, `is_visible`
    - `public.categories`, `public.inquiries`, `public.day_out_inquiry`, `public.contact_inquiry`
    - `public.user_roles` — admin role assignments (links to `auth.users`)
    - `public.homepage_settings` / `public.site_content` — site content single-row tables

    Views & helper RPCs (site-friendly API layer)
    -------------------------------------------
    These views are the public, stable API consumed by the website frontend. Use them instead of querying base tables directly from the website.

    - `public.vw_published_tours`
    - Purpose: list of published tours, aggregated images and category metadata. Filters `is_published=true` and `status <> 'archived'`.
    - Use for listing pages, featured sections, and feeds.

    - `public.vw_tour_by_slug`
    - Purpose: detailed payload for a single tour (sections, images, overview, itinerary)
    - Use for tour detail page.

    - `public.check_tour_slug_available(p_slug text, p_tour_id uuid)`
    - Purpose: RPC to validate slug availability case-insensitively. Admin UI calls this before save.

    Storage & file organization
    ---------------------------
    - Buckets (public): `tour-images`, `category-images`, `homepage-images`.
    - Recommended path: `tour-images/{tour-id}/{filename}` (server-first upload).
    - Public read access is configured via storage policies; admin-only upload/delete controlled by RLS policies on `storage.objects`.

    Admin flows (cookbook)
    ----------------------
    All steps below assume you have a Supabase project and the env vars set.

    1) Create Admin User and assign role (one-time)
    - Create the auth user in Supabase (Auth → Users → Invite/Create). Use the admin email.
    - Assign role with SQL (run in SQL editor):
        ```sql
        INSERT INTO public.user_roles (user_id, role)
        SELECT id, 'admin' FROM auth.users WHERE email = 'gokulravindran08@gmail.com'
        ON CONFLICT (user_id, role) DO NOTHING;
        ```

    2) Create a new Tour (server-first upload)
    - In the admin UI (`/admin/tours/new`) click Add Tour. The upload components call `ensureDraftTour` which:
        A. Creates a draft tour row (status=draft, is_published=false) and returns `tour.id`.
        B. Image upload uses that `tour.id` for path `tour-images/{tourId}/{filename}`.
    - Fill fields (title, short_description, overview via TipTap, itinerary via ItineraryBuilder).
    - Add gallery images using the gallery uploader; order by drag-and-drop.
    - Save Draft to persist; Publish to set `is_published=true` and `status='published'`.

    3) How images are stored and referenced
    - File upload stores file in `tour-images/{tourId}/{filename}` and returns a public URL.
    - Admin UI on submit writes a `tour_images` row for each gallery entry with `image_url` = returned public URL.

    4) How overview & itinerary are stored
    - `overview`: TipTap editor outputs HTML; admin saves this into `tour_sections` under type `overview` with `content: { html: '<p>...</p>' }`.
    - `itinerary`: Editor or builder output saved into `tour_sections` or `tours.itinerary` as JSON (the current implementation writes to `tour_sections` with `content.itinerary`).

    Website integration (plug-and-play)
    ----------------------------------
    Use the Supabase JS client or simple REST to read the views. Example using `@supabase/supabase-js`:

    JavaScript — fetch published tours (list)
    ```javascript
    import { createClient } from '@supabase/supabase-js';
    const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

    export async function getPublishedTours(limit = 20, offset = 0) {
    const { data, error } = await supabase
        .from('vw_published_tours')
        .select('*')
        .order('display_order', { ascending: true })
        .range(offset, offset + limit - 1);
    if (error) throw error;
    return data;
    }
    ```

    JavaScript — fetch tour detail by slug
    ```javascript
    export async function getTourBySlug(slug) {
    const { data, error } = await supabase
        .from('vw_tour_by_slug')
        .select('*')
        .eq('slug', slug)
        .single();
    if (error) throw error;
    return data;
    }
    ```

    Important: render `overview_content` HTML safely. Options:
    - Trust admin HTML (fast) — use a sanitizer like DOMPurify before injection with `dangerouslySetInnerHTML`.
    - Or create a renderer if you switch to JSON-based rich text in future.

    Security: RLS and keys
    ----------------------
    - Use the `anon` key on the website for reads only. RLS policies restrict `anon` to select published views and to insert inquiries.
    - Use `authenticated` / service keys only in admin (browser admin uses Supabase auth and has admin role checks via `user_roles`).
    - Never embed service keys in client-side code.

    DB completion tasks executed (what we did)
    -----------------------------------------
    - Added case-insensitive unique index on `lower(slug)` to avoid slug collisions.
    - Backfilled `tour_images` from `tours.image_gallery_urls` JSONB into normalized `tour_images` rows.
    - Created `vw_published_tours` and `vw_tour_by_slug` views and `check_tour_slug_available` RPC.

    DB completion recommended next steps
    -----------------------------------
    - Run RLS verification (see `supabase/migrations/20251024121000_rls_verification.sql`) using anon and admin keys.
    - Schedule backups and enable logging/alerts in Supabase dashboard.

    Operational safety rules (must-follow, copied and adapted from your rules file)
    ----------------------------------------------------------------------------
    1) Preserve Functionality: Do not change or remove any code touching critical services (Branch.io, FCM, deep linking). Always test in staging before production.
    2) No Redundancy: Avoid duplicate data or duplicate codepaths. Use `tour_images` and `tour_sections` as single sources of truth.
    3) Prevent Loops: If a script or migration behaves unexpectedly, stop immediately and investigate — do not retry blindly.
    4) Evidence-Based Changes: Before each change, collect evidence (schema, logs, migration status, lints) and document the reason.
    5) Incremental Implementation: Make small, reversible edits; run one migration at a time and verify.

    Cookbook — typical operations
    ----------------------------
    Operation: Add admin via SQL (after user exists)
    ```sql
    INSERT INTO public.user_roles (user_id, role)
    SELECT id, 'admin' FROM auth.users WHERE email = 'admin@example.com'
    ON CONFLICT (user_id, role) DO NOTHING;
    ```

    Operation: Create a draft tour (server)
    ```sql
    INSERT INTO public.tours (title, slug, status, is_published, display_order, created_by)
    VALUES ('Draft title', 'draft-slug', 'draft', false, 999, 'AUTH_USER_ID')
    RETURNING id;
    ```

    Operation: Upload an image (server-first)
    1. Upload file to storage path `tour-images/{tourId}/{filename}` via SDK
    2. Insert metadata row into `public.tour_images`:
    ```sql
    INSERT INTO public.tour_images (tour_id, image_url, caption, display_order, section, alt_text, is_active)
    VALUES ('{tourId}', '{publicUrl}', 'caption', 1, 'gallery', 'alt', true);
    ```

    Operation: Publish a tour (atomic)
    Prefer an RPC or small transaction to set `is_published=true` and `status='published'`. Example:
    ```sql
    BEGIN;
    UPDATE public.tours SET is_published = true, status = 'published', updated_at = timezone('utc', now()) WHERE id = '{tourId}';
    COMMIT;
    ```

    RLS verification steps (manual)
    1. Using anon key, fetch `SELECT * FROM public.vw_published_tours LIMIT 5;` — should succeed.
    2. Using anon key, attempt `INSERT` into `public.tours` — should be denied.
    3. Using admin credentials, perform an update/insert on `public.tours` and `public.tour_images` — should succeed.

    Troubleshooting
    ---------------
    - Images missing: confirm storage object `bucket_id` and `is_active` = true, and storage policy allows public read.
    - Slug conflict on publish: use `check_tour_slug_available` and inspect `idx_tours_slug_ci` for duplicates.
    - RLS permission denied for admin: check `user_roles` row exists and `public.has_role(auth.uid(), 'admin')` returns true.

    Appendix: Useful SQL snippets
    ----------------------------
    - List applied migrations:
    ```sql
    SELECT version, name FROM supabase_migrations.schema_migrations ORDER BY version;
    ```
    - Find duplicate slugs (case-insensitive):
    ```sql
    SELECT lower(slug) as s, count(*) FROM public.tours GROUP BY lower(slug) HAVING count(*) > 1;
    ```

    Maintenance & best practices
    ----------------------------
    - Run migrations in staging before production.
    - Keep `VITE_SUPABASE_SERVICE_KEY` secure and limited to server tasks.
    - Periodically run the RLS verification queries and inspect Supabase logs for denials.

    Contact & next steps
    --------------------
    If you want, I will now:
    - (A) produce a short checklist for the website team to switch from mocks to the real DB views (code examples included), or
    - (B) prepare the RLS verification runbook and run it against staging.

    End of manual.




