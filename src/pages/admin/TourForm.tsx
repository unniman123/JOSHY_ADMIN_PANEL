import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { checkAdminAccess } from '@/lib/auth';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RichTextEditor from '@/components/admin/RichTextEditor';
import ImageUpload from '@/components/admin/ImageUpload';
import ImageGallery from '@/components/admin/ImageGallery';
import ItineraryBuilder from '@/components/admin/ItineraryBuilder';
import { Skeleton } from '@/components/ui/skeleton';
import type { TablesInsert } from '@/integrations/supabase/types';

export default function TourForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category_id: '',
    short_description: '',
    overview: '',
    featured_image_url: '',
    image_gallery_urls: [] as any[],
    itinerary: [] as any[],
    display_order: '999',
    is_featured: false,
    is_day_out_package: false,
    is_published: true,
    rating: '',
    location: '',
  });
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugMessage, setSlugMessage] = useState('');
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const initialSnapshotRef = useRef<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Helper to ensure a draft tour exists for server-first uploads
  const ensureDraftTour = async (): Promise<string | null> => {
    // If editing existing tour, id is available
    if (id) return id;

    // Otherwise create a published tour and return new id
    try {
      const { data, error } = await supabase
        .from('tours')
        .insert([
          {
            title: formData.title || 'Untitled',
            slug: formData.slug || 'untitled-' + Math.random().toString(36).slice(2,8),
            status: 'published',
            is_published: true,
            display_order: parseInt(formData.display_order || '999')
          }
        ])
        .select('id')
        .single();

      if (error || !data) throw error || new Error('Failed to create tour');
      // After creating tour, navigate to edit page for consistency
      navigate(`/admin/tours/edit/${data.id}`);
      return data.id;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  useEffect(() => {
    checkAccess();
    loadCategories();
    if (id) {
      loadTour();
    } else {
      setLoading(false);
    }
  }, [id]);

  // Initialize snapshot after load to detect changes
  useEffect(() => {
    if (!loading) {
      initialSnapshotRef.current = JSON.stringify(formData);
      setIsDirty(false);
    }
  }, [loading]);

  // Mark dirty when formData diverges from initial snapshot
  useEffect(() => {
    if (loading) return;
    const current = JSON.stringify(formData);
    setIsDirty(current !== initialSnapshotRef.current);
  }, [formData, loading]);

  // Autosave every 30s when dirty
  useEffect(() => {
    const interval = setInterval(async () => {
      if (isDirty && !saving) {
        try {
          await saveDraftAutosave();
        } catch (e) {
          console.warn('Autosave error', e);
        }
      }
    }, 30000);

    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', beforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, [isDirty, saving]);

  // Minimal autosave implementation: update core tour fields only
  const saveDraftAutosave = async (): Promise<void> => {
    if (!formData) return;
    setSaving(true);
    try {
      if (!id) {
        // create draft which will navigate to edit page via ensureDraftTour
        await ensureDraftTour();
        return;
      }

      const tourData: TablesInsert<'tours'> = {
        title: formData.title,
        slug: formData.slug,
        category_id: formData.category_id || null,
        short_description: formData.short_description,
        overview: formData.overview,
        featured_image_url: formData.featured_image_url,
        display_order: parseInt(formData.display_order),
        is_featured: formData.is_featured,
        is_day_out_package: formData.is_day_out_package,
        is_published: true,
        status: 'published' as const,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        location: formData.location || null,
      };

      const result = await supabase
        .from('tours')
        .update(tourData)
        .eq('id', id)
        .select('id')
        .single();

      if (!result.error) {
        initialSnapshotRef.current = JSON.stringify(formData);
        setIsDirty(false);
        setLastSavedAt(Date.now());
      }
    } catch (err) {
      console.warn('Autosave failed', err);
    } finally {
      setSaving(false);
    }
  };

  const checkAccess = async () => {
    const hasAccess = await checkAdminAccess();
    if (!hasAccess) {
      navigate('/admin/login');
    }
  };

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, parent_category, display_order')
      .eq('is_active', true)
      .order('parent_category')
      .order('display_order');

    if (!error && data) {
      setCategories(data);
    }
  };

  const loadTour = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('tours')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load tour',
        variant: 'destructive',
      });
      navigate('/admin/tours');
      return;
    }

    setFormData({
      title: data.title || '',
      slug: data.slug || '',
      category_id: data.category_id || '',
      short_description: data.short_description || '',
      overview: typeof data.overview === 'string' ? data.overview : '',
      featured_image_url: data.featured_image_url || '',
      image_gallery_urls: Array.isArray(data.image_gallery_urls) ? data.image_gallery_urls : [],
      itinerary: Array.isArray(data.itinerary) ? data.itinerary : [],
      display_order: data.display_order?.toString() || '999',
      is_featured: data.is_featured || false,
      is_day_out_package: data.is_day_out_package || false,
      is_published: data.is_published || false,
      rating: data.rating?.toString() || '',
      location: data.location || '',
    });
    setLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const resetSlugValidation = () => {
    setSlugAvailable(null);
    setSlugMessage('');
  };

  const handleTitleChange = (value: string) => {
    setFormData({
      ...formData,
      title: value,
      slug: generateSlug(value),
    });
    resetSlugValidation();
  };

  const handleSlugChange = (value: string) => {
    setFormData({
      ...formData,
      slug: value,
    });
    resetSlugValidation();
  };

  const checkSlugAvailability = async (value: string): Promise<boolean> => {
    const trimmedSlug = value.trim();
    if (!trimmedSlug) {
      setSlugAvailable(null);
      setSlugMessage('Slug is required.');
      return false;
    }

    setCheckingSlug(true);
    try {
      const { data, error } = await supabase.rpc('check_tour_slug_available', {
        p_slug: trimmedSlug,
        p_tour_id: id ?? null,
      });

      if (error) {
        throw error;
      }

      const available = Boolean(data);
      setSlugAvailable(available);
      if (!available) {
        setSlugMessage('Slug is already in use. Choose another value.');
      } else {
        setSlugMessage('Slug is available.');
      }
      return available;
    } catch (err) {
      setSlugAvailable(false);
      setSlugMessage('Unable to validate slug. Please try again.');
      return false;
    } finally {
      setCheckingSlug(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // client-side validation
      const errors: Record<string, string> = {};
      if (!formData.title || formData.title.trim().length === 0) errors.title = 'Title is required.';
      if (!formData.slug || formData.slug.trim().length === 0) errors.slug = 'Slug is required.';
      const ratingVal = (formData as any).rating;
      if (ratingVal !== undefined && ratingVal !== null && ratingVal !== '' ) {
        const r = Number(ratingVal);
        if (Number.isNaN(r) || r < 0 || r > 5) errors.rating = 'Rating must be between 0.0 and 5.0.';
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        toast({ title: 'Validation error', description: 'Fix form errors before saving.', variant: 'destructive' });
        setSaving(false);
        return;
      }
      setFormErrors({});
      const trimmedSlug = formData.slug.trim();
      if (!trimmedSlug) {
        toast({
          title: 'Invalid slug',
          description: 'Slug is required to save a tour.',
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }

      const slugOk = await checkSlugAvailability(trimmedSlug);
      if (!slugOk) {
        toast({
          title: 'Slug unavailable',
          description: 'Please choose a different slug before saving.',
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }

      const tourData: TablesInsert<'tours'> = {
        title: formData.title,
        slug: trimmedSlug,
        category_id: formData.category_id || null,
        short_description: formData.short_description,
        overview: formData.overview,
        featured_image_url: formData.featured_image_url,
        image_gallery_urls: formData.image_gallery_urls,
        itinerary: formData.itinerary,
        display_order: parseInt(formData.display_order),
        is_featured: formData.is_featured,
        is_day_out_package: formData.is_day_out_package,
        is_published: true,
        status: 'published',
      };

      let error;
      let tourId = id;
      if (id) {
        const result = await supabase
          .from('tours')
          .update(tourData)
          .eq('id', id)
          .select('id')
          .single();
        if (result.error) throw result.error;
        tourId = result.data.id;
      } else {
        const result = await supabase
          .from('tours')
          .insert([tourData])
          .select('id')
          .single();
        if (result.error) throw result.error;
        tourId = result.data.id;
      }

      // Persist gallery images into tour_images table (server-first canonical storage)
      try {
        // Remove only gallery and itinerary images (preserve overview/main images)
        await supabase.from('tour_images')
          .delete()
          .eq('tour_id', tourId)
          .in('section', ['gallery', 'itinerary']);

        const imagesToInsert = (formData.image_gallery_urls || []).map((img: any, idx: number) => ({
          tour_id: tourId,
          image_url: img.url,
          caption: img.caption || null,
          display_order: img.order || idx + 1,
          section: img.section || 'gallery',
          alt_text: img.alt || null,
          is_active: true
        }));

        if (imagesToInsert.length > 0) {
          const insertRes = await supabase.from('tour_images').insert(imagesToInsert);
          if (insertRes.error) throw insertRes.error;
        }

        // Ensure overview image exists and matches featured_image_url
        if (formData.featured_image_url) {
          const { data: existingOverview } = await supabase
            .from('tour_images')
            .select('id, image_url')
            .eq('tour_id', tourId)
            .eq('section', 'overview')
            .single();

          if (!existingOverview) {
            // Insert overview image if it doesn't exist
            await supabase.from('tour_images').insert({
              tour_id: tourId,
              image_url: formData.featured_image_url,
              section: 'overview',
              display_order: 0,
              is_active: true
            });
          } else if (existingOverview.image_url !== formData.featured_image_url) {
            // Update overview image if URL changed
            await supabase
              .from('tour_images')
              .update({ image_url: formData.featured_image_url })
              .eq('id', existingOverview.id);
          }
        }
      } catch (imgErr) {
        // non-fatal: report but continue
        console.warn('Failed to persist tour images', imgErr);
      }

      // Persist overview and itinerary into tour_sections
      try {
        // remove existing overview/itinerary sections for this tour
        await supabase.from('tour_sections').delete().eq('tour_id', tourId).in('type', ['overview','itinerary']);

        // overview (store as HTML string under content.html)
        if (formData.overview) {
          await supabase.from('tour_sections').insert([{ 
            tour_id: tourId,
            type: 'overview',
            title: 'Overview',
            content: { html: formData.overview },
            order: 1,
            is_visible: true
          }]);
        }

        // itinerary (store structured JSON)
        if (formData.itinerary && Array.isArray(formData.itinerary) && formData.itinerary.length > 0) {
          await supabase.from('tour_sections').insert([{ 
            tour_id: tourId,
            type: 'itinerary',
            title: 'Itinerary',
            content: { itinerary: formData.itinerary },
            order: 2,
            is_visible: true
          }]);
        }
      } catch (secErr) {
        console.warn('Failed to persist tour sections', secErr);
      }

      toast({
        title: 'Success',
        description: `Tour ${id ? 'updated' : 'created'} successfully`,
      });
      navigate('/admin/tours');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{id ? 'Edit' : 'Create'} Tour</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  onBlur={() => checkSlugAvailability(formData.slug)}
                  required
                />
                {slugMessage && (
                  <p
                    className={`text-sm ${slugAvailable === false ? 'text-destructive' : slugAvailable ? 'text-emerald-600' : 'text-muted-foreground'}`}
                  >
                    {checkingSlug ? 'Checking slug availability…' : slugMessage}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(new Set(categories.map(cat => cat.parent_category).filter(Boolean))).map((parentCat) => {
                      const subcategories = categories.filter(cat => cat.parent_category === parentCat && cat.name !== parentCat);
                      if (subcategories.length === 0) return null;
                      return (
                        <div key={parentCat}>
                          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                            {parentCat}
                          </div>
                          {subcategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id} className="pl-6">
                              {cat.name}
                            </SelectItem>
                          ))}
                        </div>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description">Short Description</Label>
                <Textarea
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  maxLength={200}
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">
                  {formData.short_description.length}/200 characters
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Overview</Label>
                <RichTextEditor
                  content={formData.overview}
                  onChange={(content) => setFormData({ ...formData, overview: content })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ImageUpload
                label="Main Image"
                currentImage={formData.featured_image_url}
                onImageChange={(url) => setFormData({ ...formData, featured_image_url: url })}
                tourId={id}
                onRequireTourId={ensureDraftTour}
                imageType="main"
              />
              
              <ImageGallery
                images={formData.image_gallery_urls}
                onChange={(images) => setFormData({ ...formData, image_gallery_urls: images })}
                // Provide a handler so uploads can create a draft tour first when needed
                onRequireTourId={ensureDraftTour}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Itinerary</CardTitle>
            </CardHeader>
            <CardContent>
              <ItineraryBuilder
                itinerary={formData.itinerary}
                onChange={(itinerary) => setFormData({ ...formData, itinerary })}
              />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Display Settings
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure how this tour appears across different sections of your website
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Display Order Section */}
              <div className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <Label htmlFor="display_order" className="text-sm font-medium text-gray-700">
                    Display Priority
                  </Label>
                </div>
                <div className="space-y-2">
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                    min="0"
                    className="w-24"
                    placeholder="999"
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-gray-400 rounded-full"></span>
                    Lower numbers appear first in listings
                  </p>
                </div>
              </div>

              {/* Featured Sections */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <Label className="text-sm font-medium text-gray-700">
                    Featured Sections
                  </Label>
                </div>

                <div className="grid gap-3">
                  {/* Featured Tour Checkbox */}
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="is_featured"
                        checked={formData.is_featured}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked as boolean })}
                        className="data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                      />
                      <div className="flex-1">
                        <Label htmlFor="is_featured" className="cursor-pointer font-medium text-gray-800">
                          Featured Tour
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Display prominently on the homepage hero section
                        </p>
                      </div>
                    </div>
                    <div className="text-yellow-500">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>

                  {/* Day Out Package Checkbox */}
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="is_day_out_package"
                        checked={formData.is_day_out_package}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_day_out_package: checked as boolean })}
                        className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                      />
                      <div className="flex-1">
                        <Label htmlFor="is_day_out_package" className="cursor-pointer font-medium text-gray-800">
                          Day Out Package
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Include in the dedicated day out packages section
                        </p>
                      </div>
                    </div>
                    <div className="text-blue-500">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <Label className="text-sm font-medium text-gray-700">
                    Additional Details
                  </Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rating" className="text-sm font-medium text-gray-700">
                      Tour Rating
                    </Label>
                    <div className="relative">
                      <Input
                        id="rating"
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={(formData as any).rating ?? ''}
                        onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                        className="pr-12"
                        placeholder="0.0"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">/5.0</span>
                        <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Rate from 0.0 to 5.0 stars
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                      Location
                    </Label>
                    <div className="relative">
                      <Input
                        id="location"
                        value={(formData as any).location ?? ''}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Paris, France"
                        className="pl-9"
                      />
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Primary destination or region
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Tour'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/admin/tours')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
