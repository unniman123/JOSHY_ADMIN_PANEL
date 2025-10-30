import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  label: string;
  currentImage?: string;
  onImageChange: (url: string) => void;
  bucket?: string;
  // Optional tour id to upload under (recommended). If not provided,
  // ImageUpload will call onRequireTourId to obtain one before uploading.
  tourId?: string | null;
  onRequireTourId?: () => Promise<string>;
}

export default function ImageUpload({ 
  label, 
  currentImage, 
  onImageChange, 
  bucket = 'tour-images',
  tourId,
  onRequireTourId
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB)
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
      // Determine file path. If a tourId is available, store under tour-id folder.
      let filePath: string;
      const targetTourId = tourId ?? (onRequireTourId ? await onRequireTourId() : null);
      if (targetTourId) {
        filePath = `${targetTourId}/${fileName}`;
      } else {
        filePath = `${fileName}`;
      }

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onImageChange(publicUrl);
      
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
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

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {currentImage && (
        <div className="relative inline-block">
          <img src={currentImage} alt="Preview" className="h-32 w-32 object-cover rounded-lg" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={() => onImageChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
          id={`file-upload-${label}`}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById(`file-upload-${label}`)?.click()}
          disabled={uploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload Image'}
        </Button>
      </div>
    </div>
  );
}
