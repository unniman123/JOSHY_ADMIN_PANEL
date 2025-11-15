import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, ArrowUp, ArrowDown, Trash2, Crop, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ImageCropper from './ImageCropper';
import type { GalleryImage, CropData } from '@/types/database';

interface ImageGalleryProps {
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
  bucket?: string;
  // Optional callback to obtain or create a tour id for server-first uploads
  onRequireTourId?: () => Promise<string | null>;
}

export default function ImageGallery({ images, onChange, bucket = 'tour-images', onRequireTourId }: ImageGalleryProps) {
  const [uploading, setUploading] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
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

    // Validate file type (only JPEG, PNG, WebP allowed)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast({
        title: 'Error',
        description: 'Only JPEG, PNG, and WebP images are allowed',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      // If the caller provided a tour id generator, use it to place the file under that tour folder
      let filePath = `${fileName}`;
      try {
        const maybeTourId = onRequireTourId ? await onRequireTourId() : null;
        if (maybeTourId) filePath = `${maybeTourId}/${fileName}`;
      } catch (err) {
        // If obtaining tour id fails, fall back to root path
      }

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      const newImage: GalleryImage = {
        url: publicUrl,
        order: images.length + 1,
        section: 'gallery',
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

  const handleOpenCropper = (index: number) => {
    setSelectedImageIndex(index);
    setCropperOpen(true);
  };

  const handleCropComplete = (cropData: CropData) => {
    if (selectedImageIndex !== null) {
      const newImages = [...images];
      newImages[selectedImageIndex] = {
        ...newImages[selectedImageIndex],
        cropData,
      };
      
      console.log('✂️ Crop applied to image', selectedImageIndex);
      console.log('📐 Crop data:', cropData);
      console.log('🖼️ Updated image:', newImages[selectedImageIndex]);
      
      onChange(newImages);
      
      toast({
        title: 'Crop Applied',
        description: 'Remember to click "Save Changes" to persist this crop!',
        duration: 5000,
      });
    }
    setCropperOpen(false);
    setSelectedImageIndex(null);
  };

  const handleCloseCropper = () => {
    setCropperOpen(false);
    setSelectedImageIndex(null);
  };

  return (
    <div className="space-y-4">
      <Label>Gallery Images</Label>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {images.map((image, index) => (
          <div key={index} className="space-y-2">
            <div className="relative">
              <img
                src={image.url}
                alt={`Gallery ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                #{image.order}
              </div>
              {image.cropData && (
                <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Cropped
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => moveImage(index, 'up')}
                disabled={index === 0}
              >
                <ArrowUp className="h-4 w-4 mr-1" />
                Up
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => moveImage(index, 'down')}
                disabled={index === images.length - 1}
              >
                <ArrowDown className="h-4 w-4 mr-1" />
                Down
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleOpenCropper(index)}
              >
                <Crop className="h-4 w-4 mr-1" />
                Crop
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeImage(index)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <Input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
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

      {/* Image Cropper Modal */}
      {selectedImageIndex !== null && (
        <ImageCropper
          imageUrl={images[selectedImageIndex].url}
          open={cropperOpen}
          onClose={handleCloseCropper}
          onCropComplete={handleCropComplete}
          initialCropData={images[selectedImageIndex].cropData}
          aspectRatio={16 / 9}
        />
      )}
    </div>
  );
}
