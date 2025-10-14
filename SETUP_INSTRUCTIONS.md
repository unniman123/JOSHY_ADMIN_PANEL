# Admin Panel Setup Instructions

## Prerequisites
- A Supabase project (create one at https://supabase.com)
- Node.js and npm installed

## Step 1: Run Database Migrations

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Open the file `supabase/migrations/20240101000000_initial_schema.sql`
4. Copy and paste the entire SQL script into the SQL Editor
5. Click "Run" to execute the migration

This will create:
- All necessary tables (categories, tours, tour_images, inquiries, homepage_settings, user_roles)
- Row Level Security (RLS) policies
- Storage buckets for images
- Required indexes and constraints

## Step 2: Create Your First Admin User

After running the migration, you need to assign the admin role to a user:

1. Sign up a new user in your app (or use an existing user)
2. In Supabase SQL Editor, run this command with your user's email:

```sql
-- Replace 'your-email@example.com' with your actual email
insert into public.user_roles (user_id, role)
select id, 'admin'::app_role
from auth.users
where email = 'your-email@example.com';
```

## Step 3: Configure Environment Variables

Create a `.env` file in the project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase project settings under API.

## Step 4: Install Dependencies and Run

```bash
npm install
npm run dev
```

## Step 5: Access the Admin Panel

1. Navigate to `/admin/login`
2. Sign in with your admin user credentials
3. You should now have access to the admin panel

## Database Schema Overview

### Tables Created:
- `user_roles` - Stores user role assignments (admin, moderator, user)
- `categories` - Tour categories with hierarchical support
- `tours` - Tour listings with all details
- `tour_images` - Multiple images per tour
- `inquiries` - Customer inquiries/contact form submissions
- `homepage_settings` - Dynamic homepage content management

### Storage Buckets:
- `tour-images` - Tour photos and galleries
- `category-images` - Category thumbnail images
- `homepage-images` - Homepage hero and featured images

## Security Notes

- All tables use Row Level Security (RLS)
- Admin access is controlled via the `user_roles` table
- Never store admin credentials in localStorage or client-side code
- The `has_role()` function uses `SECURITY DEFINER` to prevent RLS recursion issues

## Troubleshooting

If you encounter "new row violates row-level security policy":
- Ensure your user has been assigned the 'admin' role in the user_roles table
- Check that you're authenticated when making requests

For storage issues:
- Verify the storage buckets were created successfully
- Check that the storage policies are applied

## Next Steps

Once setup is complete, you can:
1. Create categories for your tours
2. Add tour listings
3. Upload images to tours
4. Manage customer inquiries
5. Customize homepage content
