import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Category, ParentCategoryType } from '@/types/database';

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onSuccess: () => void;
}

export default function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategoryDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parent_category: '' as string,
    display_order: 0,
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        parent_category: category.parent_category || '',
        display_order: category.display_order,
        is_active: category.is_active,
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        parent_category: '',
        display_order: 0,
        is_active: true,
      });
    }
  }, [category, open]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data with proper typing
      const dataToSave = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        parent_category: (formData.parent_category || null) as ParentCategoryType | null,
        display_order: formData.display_order,
        is_active: formData.is_active,
      };

      if (category) {
        const { error } = await supabase
          .from('categories')
          .update(dataToSave)
          .eq('id', category.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Category updated' });
      } else {
        const { error } = await supabase.from('categories').insert([dataToSave]);

        if (error) throw error;
        toast({ title: 'Success', description: 'Category created' });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save category',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Category' : 'Create Category'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ 
                  ...formData, 
                  name: e.target.value,
                  slug: generateSlug(e.target.value)
                });
              }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent_category">Parent Category</Label>
            <Select
              value={formData.parent_category}
              onValueChange={(value) => setFormData({ ...formData, parent_category: value })}
            >
              <SelectTrigger id="parent_category">
                <SelectValue placeholder="Select parent category (optional for parent categories)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None (This is a parent category)</SelectItem>
                <SelectItem value="Kerala Travels">Kerala Travels</SelectItem>
                <SelectItem value="Discover India">Discover India</SelectItem>
                <SelectItem value="Global Holiday">Global Holiday</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Display Order</Label>
            <Input
              id="order"
              type="number"
              value={formData.display_order}
              onChange={(e) =>
                setFormData({ ...formData, display_order: parseInt(e.target.value) })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="active">Active</Label>
            <Switch
              id="active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: checked })
              }
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
