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

      const tourData = {
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
        status: 'published',
        rating: (formData as any).rating ? parseFloat((formData as any).rating) : null,
        location: (formData as any).location || null,
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
      .select('id, name, slug, parent_id, parent_category, display_order')
      .eq('is_active', true)
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

      const tourData = {
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
        // remove existing images for this tour and re-insert
        await supabase.from('tour_images').delete().eq('tour_id', tourId);

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

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
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
                    {['Kerala Travel', 'Discover India', 'Global Holiday'].map((parentCat) => {
                      const subcategories = categories.filter(cat => cat.parent_category === parentCat);
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

          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                  min="0"
                />
                <p className="text-sm text-muted-foreground">
                  Lower numbers appear first
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked as boolean })}
                />
                <Label htmlFor="is_featured" className="cursor-pointer">
                  Featured (shows on homepage)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_day_out_package"
                  checked={formData.is_day_out_package}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_day_out_package: checked as boolean })}
                />
                <Label htmlFor="is_day_out_package" className="cursor-pointer">
                  Day Out Package
                </Label>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="rating">Rating (0.0 - 5.0)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={(formData as any).rating ?? ''}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-32"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={(formData as any).location ?? ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Region"
                  />
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
