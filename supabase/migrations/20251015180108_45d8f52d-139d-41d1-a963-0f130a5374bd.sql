-- Create enum types
create type public.app_role as enum ('admin', 'moderator', 'user');
create type public.tour_status as enum ('draft', 'published', 'archived');
create type public.inquiry_status as enum ('new', 'in_progress', 'resolved', 'closed');

-- User Roles Table
create table public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role app_role not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Security definer function to check roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Categories Table
create table public.categories (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    description text,
    parent_id uuid references public.categories(id) on delete cascade,
    image_url text,
    display_order integer default 0,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.categories enable row level security;

create index idx_categories_parent_id on public.categories(parent_id);
create index idx_categories_slug on public.categories(slug);

-- Tours Table
create table public.tours (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    slug text not null unique,
    description text,
    short_description text,
    category_id uuid references public.categories(id) on delete set null,
    price decimal(10,2),
    duration_days integer,
    max_group_size integer,
    difficulty_level text,
    featured_image_url text,
    status tour_status default 'draft',
    meta_title text,
    meta_description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references auth.users(id) on delete set null
);

alter table public.tours enable row level security;

create index idx_tours_category_id on public.tours(category_id);
create index idx_tours_status on public.tours(status);
create index idx_tours_slug on public.tours(slug);

-- Tour Images Table
create table public.tour_images (
    id uuid primary key default gen_random_uuid(),
    tour_id uuid references public.tours(id) on delete cascade not null,
    image_url text not null,
    caption text,
    display_order integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.tour_images enable row level security;

create index idx_tour_images_tour_id on public.tour_images(tour_id);

-- Inquiries Table
create table public.inquiries (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text not null,
    phone text,
    tour_id uuid references public.tours(id) on delete set null,
    message text not null,
    status inquiry_status default 'new',
    admin_notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.inquiries enable row level security;

create index idx_inquiries_status on public.inquiries(status);
create index idx_inquiries_tour_id on public.inquiries(tour_id);
create index idx_inquiries_created_at on public.inquiries(created_at desc);

-- Homepage Settings Table
create table public.homepage_settings (
    id uuid primary key default gen_random_uuid(),
    hero_title text,
    hero_subtitle text,
    hero_image_url text,
    featured_tours jsonb default '[]'::jsonb,
    testimonials jsonb default '[]'::jsonb,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_by uuid references auth.users(id) on delete set null
);

alter table public.homepage_settings enable row level security;

-- Insert default homepage settings
insert into public.homepage_settings (hero_title, hero_subtitle) 
values ('Welcome to Our Tours', 'Discover amazing destinations');

-- RLS Policies for user_roles
create policy "Users can view their own roles"
on public.user_roles for select
to authenticated
using (user_id = auth.uid());

create policy "Admins can view all roles"
on public.user_roles for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert roles"
on public.user_roles for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete roles"
on public.user_roles for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for categories
create policy "Anyone can view active categories"
on public.categories for select
using (is_active = true or public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert categories"
on public.categories for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update categories"
on public.categories for update
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete categories"
on public.categories for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for tours
create policy "Anyone can view published tours"
on public.tours for select
using (status = 'published' or public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert tours"
on public.tours for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update tours"
on public.tours for update
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete tours"
on public.tours for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for tour_images
create policy "Anyone can view tour images"
on public.tour_images for select
using (true);

create policy "Admins can manage tour images"
on public.tour_images for all
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for inquiries
create policy "Admins can view all inquiries"
on public.inquiries for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Anyone can insert inquiries"
on public.inquiries for insert
with check (true);

create policy "Admins can update inquiries"
on public.inquiries for update
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete inquiries"
on public.inquiries for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for homepage_settings
create policy "Anyone can view homepage settings"
on public.homepage_settings for select
using (true);

create policy "Admins can update homepage settings"
on public.homepage_settings for update
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Storage buckets
insert into storage.buckets (id, name, public)
values 
  ('tour-images', 'tour-images', true),
  ('category-images', 'category-images', true),
  ('homepage-images', 'homepage-images', true);

-- Storage policies
create policy "Anyone can view images"
on storage.objects for select
using (bucket_id in ('tour-images', 'category-images', 'homepage-images'));

create policy "Admins can upload images"
on storage.objects for insert
to authenticated
with check (
  bucket_id in ('tour-images', 'category-images', 'homepage-images')
  and public.has_role(auth.uid(), 'admin')
);

create policy "Admins can delete images"
on storage.objects for delete
to authenticated
using (
  bucket_id in ('tour-images', 'category-images', 'homepage-images')
  and public.has_role(auth.uid(), 'admin')
);