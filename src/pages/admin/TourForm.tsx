import { useState, useEffect } from 'react';
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
    price: '',
    duration_days: '',
    display_order: '999',
    is_featured: false,
    is_day_out_package: false,
    is_published: false,
  });

  useEffect(() => {
    checkAccess();
    loadCategories();
    if (id) {
      loadTour();
    } else {
      setLoading(false);
    }
  }, [id]);

  const checkAccess = async () => {
    const hasAccess = await checkAdminAccess();
    if (!hasAccess) {
      navigate('/admin/login');
    }
  };

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
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
      price: data.price?.toString() || '',
      duration_days: data.duration_days?.toString() || '',
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

  const handleTitleChange = (value: string) => {
    setFormData({
      ...formData,
      title: value,
      slug: generateSlug(value),
    });
  };

  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault();
    setSaving(true);

    try {
      const tourData = {
        title: formData.title,
        slug: formData.slug,
        category_id: formData.category_id || null,
        short_description: formData.short_description,
        overview: formData.overview,
        featured_image_url: formData.featured_image_url,
        image_gallery_urls: formData.image_gallery_urls,
        itinerary: formData.itinerary,
        price: formData.price ? parseFloat(formData.price) : null,
        duration_days: formData.duration_days ? parseInt(formData.duration_days) : null,
        display_order: parseInt(formData.display_order),
        is_featured: formData.is_featured,
        is_day_out_package: formData.is_day_out_package,
        is_published: publish || formData.is_published,
      };

      let error;
      if (id) {
        const result = await supabase
          .from('tours')
          .update(tourData)
          .eq('id', id);
        error = result.error;
      } else {
        const result = await supabase
          .from('tours')
          .insert([tourData]);
        error = result.error;
      }

      if (error) throw error;

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
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
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
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
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
              />
              
              <ImageGallery
                images={formData.image_gallery_urls}
                onChange={(images) => setFormData({ ...formData, image_gallery_urls: images })}
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
              <CardTitle>Pricing & Duration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (INR)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration_days">Duration (Days)</Label>
                  <Input
                    id="duration_days"
                    type="number"
                    value={formData.duration_days}
                    onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                    min="1"
                  />
                </div>
              </div>
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

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked as boolean })}
                />
                <Label htmlFor="is_published" className="cursor-pointer">
                  Published (visible on website)
                </Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button 
              type="button" 
              onClick={(e) => handleSubmit(e, true)} 
              disabled={saving}
              variant="default"
            >
              {saving ? 'Publishing...' : 'Publish'}
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
