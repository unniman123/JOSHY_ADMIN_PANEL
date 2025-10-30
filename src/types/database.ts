export type AppRole = 'admin' | 'moderator' | 'user';
export type TourStatus = 'draft' | 'published' | 'archived';
export type InquiryStatus = 'new' | 'in_progress' | 'resolved' | 'closed';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tour {
  id: string;
  title: string;
  slug: string;
  description?: string;
  short_description?: string;
  category_id?: string;
  price?: number;
  duration_days?: number;
  max_group_size?: number;
  difficulty_level?: string;
  featured_image_url?: string;
  status: TourStatus;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  rating?: number;
  review_count?: number;
  location?: string;
}

export interface TourImage {
  id: string;
  tour_id: string;
  image_url: string;
  caption?: string;
  display_order: number;
  created_at: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  contact_number?: string;
  tour_id?: string;
  message: string;
  status: InquiryStatus;
  admin_notes?: string;
  nationality?: string;
  date_of_travel?: string;
  number_of_people?: string;
  number_of_kids?: string;
  number_of_rooms?: number;
  hotel_category?: '3-star' | '4-star' | '5-star';
  created_at: string;
  updated_at: string;
  submitted_at: string;
}

export interface HomepageSettings {
  id: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_image_url?: string;
  featured_tours: any[];
  testimonials: any[];
  updated_at: string;
  updated_by?: string;
}
