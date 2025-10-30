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
import type { HomepageSettings } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ImageUpload from '@/components/admin/ImageUpload';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [formData, setFormData] = useState({
    hero_title: '',
    hero_subtitle: '',
    hero_image_url: '',
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
      .from('homepage_settings')
      .select('*')
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      });
    } else if (data) {
      setSettings(data);
      setFormData({
        hero_title: data.hero_title || '',
        hero_subtitle: data.hero_subtitle || '',
        hero_image_url: data.hero_image_url || '',
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (settings) {
        const { error } = await supabase
          .from('homepage_settings')
          .update(formData)
          .eq('id', settings.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Settings updated' });
      }
    } catch (error: any) {
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

              <ImageUpload
                label="Hero Banner Image"
                currentImage={formData.hero_image_url}
                onImageChange={(url) => setFormData({ ...formData, hero_image_url: url })}
                bucket="homepage-images"
              />

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
