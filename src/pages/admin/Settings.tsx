import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAdminAccess } from '@/lib/auth';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { HomepageSettings, GalleryImage } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ImageGallery from '@/components/admin/ImageGallery';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formData, setFormData] = useState({
    hero_title: '',
    hero_subtitle: '',
    hero_images: [] as GalleryImage[],
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAccess();
    loadSettings();
  }, []);

  const checkAccess = async () => {
    const hasAccess = await checkAdminAccess();
    if (!hasAccess) navigate('/admin/login');
  };

  const loadSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('element_key', 'homepage_hero_banner')
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      });
    } else if (data) {
      setSettings(data);
      const content = data.content_value || {};
      setFormData({
        hero_title: content.title || '',
        hero_subtitle: content.subtitle || '',
        hero_images: content.images || [],
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const contentValue = {
        title: formData.hero_title,
        subtitle: formData.hero_subtitle,
        images: formData.hero_images,
      };

      // Debug logging
      console.log('🔍 Attempting to save hero banner settings...');
      console.log('📦 Content to save:', JSON.stringify(contentValue, null, 2));
      console.log('🖼️ Number of images:', formData.hero_images.length);
      console.log('✂️ Images with cropData:', formData.hero_images.filter(img => img.cropData).length);

      const { data, error } = await supabase
        .from('site_content')
        .update({ content_value: contentValue })
        .eq('element_key', 'homepage_hero_banner')
        .select();

      console.log('📡 Supabase response:', { data, error });

      if (error) throw error;
      
      console.log('✅ Save successful!');
      setHasUnsavedChanges(false);
      toast({ title: 'Success', description: 'Settings updated successfully' });
      
      // Reload settings to confirm save
      await loadSettings();
    } catch (error: any) {
      console.error('❌ Save failed:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings',
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
          <Skeleton className="h-9 w-48" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Homepage Settings</h1>
          <p className="text-muted-foreground">Manage homepage content</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hero Section</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hero_title">Hero Title</Label>
                <Input
                  id="hero_title"
                  value={formData.hero_title}
                  onChange={(e) =>
                    setFormData({ ...formData, hero_title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
                <Textarea
                  id="hero_subtitle"
                  value={formData.hero_subtitle}
                  onChange={(e) =>
                    setFormData({ ...formData, hero_subtitle: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <ImageGallery
                images={formData.hero_images}
                onChange={(images) => {
                  console.log('🔄 Images changed in gallery');
                  setFormData({ ...formData, hero_images: images });
                  setHasUnsavedChanges(true);
                }}
                bucket="homepage-images"
              />

              {hasUnsavedChanges && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-2">
                  <span className="text-yellow-800 font-medium">⚠️ You have unsaved changes</span>
                </div>
              )}

              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
