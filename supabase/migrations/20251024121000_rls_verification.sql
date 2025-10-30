-- RLS verification scripts (manual checks)

-- 1) As anon: attempt to select from vw_published_tours (should return rows only for published tours)
-- Run via anon key or client-side fetch
-- SELECT * FROM public.vw_published_tours LIMIT 5;

-- 2) As anon: attempt to insert into inquiries (should be allowed by policy)
-- INSERT INTO public.inquiries (name, email, message) VALUES ('Test','test@example.com','rls test');

-- 3) As anon: attempt to insert into tours (should be denied by RLS)
-- INSERT INTO public.tours (title, slug) VALUES ('x','x'); -- expected: permission denied




