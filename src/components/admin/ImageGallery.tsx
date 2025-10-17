import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GalleryImage {
  url: string;
  order: number;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
}

export default function ImageGallery({ images, onChange }: ImageGalleryProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'File must be under 10MB',
        variant: 'destructive',
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Only image files are allowed',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('tour-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('tour-images')
        .getPublicUrl(filePath);

      const newImage: GalleryImage = {
        url: publicUrl,
        order: images.length + 1,
      };

      onChange([...images, newImage]);
      
      toast({
        title: 'Success',
        description: 'Image added to gallery',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    // Reorder after removal
    const reorderedImages = newImages.map((img, i) => ({ ...img, order: i + 1 }));
    onChange(reorderedImages);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === images.length - 1)
    ) {
      return;
    }

    const newImages = [...images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    
    // Update order numbers
    const reorderedImages = newImages.map((img, i) => ({ ...img, order: i + 1 }));
    onChange(reorderedImages);
  };

  return (
    <div className="space-y-4">
      <Label>Gallery Images</Label>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <img 
              src={image.url} 
              alt={`Gallery ${index + 1}`} 
              className="w-full h-32 object-cover rounded-lg"
            />
            <div className="absolute top-2 right-2 flex gap-1">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-6 w-6"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="absolute bottom-2 left-2 flex gap-1">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-6 w-6"
                onClick={() => moveImage(index, 'up')}
                disabled={index === 0}
              >
                <GripVertical className="h-3 w-3 rotate-180" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-6 w-6"
                onClick={() => moveImage(index, 'down')}
                disabled={index === images.length - 1}
              >
                <GripVertical className="h-3 w-3" />
              </Button>
            </div>
            <div className="absolute top-2 left-2 bg-background/80 px-2 py-1 rounded text-xs">
              #{image.order}
            </div>
          </div>
        ))}
      </div>

      <div>
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
          id="gallery-upload"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById('gallery-upload')?.click()}
          disabled={uploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Add Image'}
        </Button>
      </div>
    </div>
  );
}
